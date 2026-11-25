// 分身の声。Web Audio で文の順に鳴らす。
// - AudioContext は押した操作(分身を呼ぶ・聞く・音を出す)の中で作って resume する。ブラウザは押される前の音を止める
// - 鳴らす前に running になっているか確かめ、ならなければ鳴らさずに進める(待ち続けない)
// - 答え 1 つ分の声は VoiceTrack(track())にまとめる。文(seq)ごとに、断片が届いたそばから AudioContext の時刻の上に並べる。
//   Worker は合成を stream で流す(本人 2026-11-25「喋り始めが遅い」)。前もって合成した声・旧形式の 1 本まるごとの声も同じ入口
// - いま鳴っている文と、その文のどこまで鳴ったか(now())を返す。字幕の濃さ・口の開け閉めはそれに従う。
//   TTS(Gemini)は字ごとの時刻を返さないので、声の大きさを 20 ms ごとに測り、間(0.16 秒以上の無音)を除いた
//   「声の出ている時間」の割合を返す。字への割り振りは呼ぶ側(avatar-guide.tsx の charAt)
// - 止まらない保険: AudioContext の時計が 1.5 秒進まなければ、その track は終わった扱いにする
// - stop() で鳴っている物も順番待ちの物も全部捨てる。次の質問や「止める」はこれを呼ぶ
// 調べやすいよう、状態の変わり目を console.info("[avatar-voice] …") に出す

const TARGET_RMS = 0.11 // 約 -19 dBFS。その場の声(Gemini の出力は約 -40 LUFS と小さい)を前もって合成した声(-16 LUFS)にそろえる
const PEAK_CAP = 0.85
/** stream の声は、これだけたまるか、最初の断片から START_WAIT_MS 経つまで鳴らし始めない(途切れの保険と音量の見積もり) */
const START_SEC = 0.8
const START_WAIT_MS = 400
/** 声の大きさを測る窓 */
const WIN_SEC = 0.02
/** これより長い無音は「間」として、字の進みを止める */
const PAUSE_SEC = 0.16
/** 文と文の間に置く無音(声の頭と末尾の無音は切ってある) */
const GAP_AFTER_SENTENCE = 0.28
const GAP_AFTER_CLAUSE = 0.08

const log = (...args: unknown[]) => console.info("[avatar-voice]", ...args)

export type TrackState = {
  /** いま鳴っている(か、声の無い文を字の速さで見せている)文の seq。文の間・待ちのときは null */
  playing: number | null
  /** その文のうち鳴った割合(0〜1、声の出ている時間で数える) */
  frac: number
  /** 声が鳴っているか(声の無い文の間は false) */
  sounding: boolean
  /** 頭から続けて鳴り終えた文の数 */
  done: number
  /** 全部鳴り終えた */
  finished: boolean
}

type Piece = { at: number; sec: number; dur: number }

type Seg = {
  seq: number
  text: string
  /** 声の無い文(字の速さで見せる長さ、秒) */
  silentSec: number | null
  rate: number
  /** 届いて、まだ並べていない PCM */
  queued: Float32Array[]
  queuedSec: number
  /** 届いた分の長さ(秒、頭を落とす前の位置) */
  receivedSec: number
  /** 20 ms ごとの RMS。届いた順 */
  rms: number[]
  carry: Float32Array
  complete: boolean
  firstAt: number
  started: boolean
  /** 頭の無音を落とした位置(秒) */
  lead: number
  gain: number
  pieces: Piece[]
  srcs: AudioBufferSourceNode[]
  /** 並べ終えた次の時刻 */
  next: number
  t0: number
  t1: number | null
}

export class VoiceTrack {
  private segs = new Map<number, Seg>()
  private active = 0
  private lastEnd = 0
  private closed = false
  private dead = false
  private timer: ReturnType<typeof setInterval> | null = null
  private stall = { t: -1, since: 0 }
  private resolveFinished!: () => void
  /** 全部鳴り終えたか、止められたら解決する */
  readonly finished: Promise<void>

  constructor(
    private ctx: AudioContext,
    private out: AudioNode,
    private onDead: (t: VoiceTrack) => void
  ) {
    this.finished = new Promise((r) => (this.resolveFinished = r))
    this.lastEnd = ctx.currentTime
    this.timer = setInterval(() => this.pump(), 50)
  }

  private seg(seq: number, text?: string): Seg {
    let s = this.segs.get(seq)
    if (!s) {
      s = {
        seq,
        text: text ?? "",
        silentSec: null,
        rate: 24000,
        queued: [],
        queuedSec: 0,
        receivedSec: 0,
        rms: [],
        carry: new Float32Array(0),
        complete: false,
        firstAt: 0,
        started: false,
        lead: 0,
        gain: 1,
        pieces: [],
        srcs: [],
        next: 0,
        t0: 0,
        t1: null,
      }
      this.segs.set(seq, s)
    }
    if (text) s.text = text
    return s
  }

  private add(s: Seg, pcm: Float32Array, rate: number) {
    if (!pcm.length) return
    if (!s.firstAt) {
      s.firstAt = performance.now()
      log("first chunk", `seq ${s.seq}`)
    }
    s.rate = rate
    s.queued.push(pcm)
    s.queuedSec += pcm.length / rate
    s.receivedSec += pcm.length / rate
    // 20 ms ごとの RMS(窓に満たない端は次へ持ち越す)
    const win = Math.round(rate * WIN_SEC)
    const all = new Float32Array(s.carry.length + pcm.length)
    all.set(s.carry)
    all.set(pcm, s.carry.length)
    let i = 0
    for (; i + win <= all.length; i += win) {
      let q = 0
      for (let j = i; j < i + win; j++) q += all[j] * all[j]
      s.rms.push(Math.sqrt(q / win))
    }
    s.carry = all.slice(i)
  }

  /** stream の断片(base64 の 16bit PCM、little endian) */
  chunk(seq: number, mime: string, data: string[], text?: string) {
    if (this.dead) return
    const s = this.seg(seq, text)
    const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000)
    for (const b64 of data) this.add(s, pcm16(b64), rate)
    this.pump()
  }

  /** 1 本まるごとの声(前もって合成した声・旧形式の audio) */
  buffer(seq: number, buf: AudioBuffer, text: string, opts: { normalize?: boolean } = {}) {
    if (this.dead) return
    const s = this.seg(seq, text)
    this.add(s, buf.getChannelData(0).slice(), buf.sampleRate)
    if (!opts.normalize) s.gain = 0.9 // 前もって合成した声は peak 1.03 まで出たので少し下げる
    s.complete = true
    this.pump()
  }

  /** その文の声は全部届いた */
  end(seq: number, text?: string) {
    if (this.dead) return
    this.seg(seq, text).complete = true
    this.pump()
  }

  /** 声の無い文。字を読む速さの長さだけ、字を進める */
  skip(seq: number, text: string, sec: number) {
    if (this.dead) return
    const s = this.seg(seq, text)
    s.silentSec = sec
    s.complete = true
    this.pump()
  }

  /** もう文は来ない。並べた分を鳴らし終えたら finished */
  close() {
    this.closed = true
    this.pump()
  }

  /** 次の seq(呼ぶ側が声の無い残りを足すとき) */
  get nextSeq() {
    return this.segs.size ? Math.max(...this.segs.keys()) + 1 : 0
  }

  kill() {
    if (this.dead) return
    this.dead = true
    if (this.timer) clearInterval(this.timer)
    for (const s of this.segs.values()) {
      for (const src of s.srcs) {
        try {
          src.stop()
        } catch {}
      }
    }
    this.onDead(this)
    this.resolveFinished()
  }

  private startSeg(s: Seg) {
    const ctx = this.ctx
    s.started = true
    if (s.silentSec !== null) {
      s.t0 = Math.max(ctx.currentTime, this.lastEnd)
      s.t1 = s.t0 + s.silentSec
      return
    }
    // 頭の無音を落とす(50 ms は残す)
    const thr = silenceThreshold(s.rms)
    const firstLoud = s.rms.findIndex((v) => v > thr)
    s.lead = Math.max(0, (firstLoud < 0 ? 0 : firstLoud) * WIN_SEC - 0.05)
    let drop = Math.round(s.lead * s.rate)
    while (drop > 0 && s.queued.length) {
      const head = s.queued[0]
      if (head.length <= drop) {
        drop -= head.length
        s.queued.shift()
      } else {
        s.queued[0] = head.subarray(drop)
        drop = 0
      }
    }
    if (s.gain === 1) s.gain = normalizeGain(concat(s.queued))
    s.t0 = Math.max(ctx.currentTime + 0.05, this.lastEnd)
    s.next = s.t0
    log("play", `seq ${s.seq}`, `lead ${s.lead.toFixed(2)}s`, `gain ${s.gain.toFixed(2)}`, `wait ${(s.t0 - ctx.currentTime).toFixed(2)}s`)
  }

  private schedule(s: Seg) {
    const ctx = this.ctx
    let sec = s.lead + s.pieces.reduce((n, p) => n + p.dur, 0)
    for (const pcm of s.queued) {
      const buf = ctx.createBuffer(1, pcm.length, s.rate)
      buf.copyToChannel(pcm as Float32Array<ArrayBuffer>, 0)
      const src = ctx.createBufferSource()
      src.buffer = buf
      const g = ctx.createGain()
      g.gain.value = s.gain
      src.connect(g).connect(this.out)
      // 届くのが鳴るのに追いつかなかったら、そこから少し先へずらす(ずれは pieces に残り、字の進みも合わせてずれる)
      const at = Math.max(s.next, ctx.currentTime + 0.02)
      src.start(at)
      s.srcs.push(src)
      s.pieces.push({ at, sec, dur: buf.duration })
      s.next = at + buf.duration
      sec += buf.duration
    }
    s.queued = []
    s.queuedSec = 0
  }

  /** 全部届いた文の終わりを決める。末尾の無音は 0.15 秒を残して切る */
  private finishSeg(s: Seg) {
    if (s.silentSec !== null) return
    const thr = silenceThreshold(s.rms)
    let lastLoud = s.rms.length - 1
    while (lastLoud > 0 && s.rms[lastLoud] <= thr) lastLoud--
    const endSec = Math.min(s.receivedSec, (lastLoud + 1) * WIN_SEC + 0.15)
    const t1 = Math.min(s.next, this.toCtx(s, endSec))
    s.t1 = t1
    for (const src of s.srcs) {
      try {
        src.stop(t1)
      } catch {}
    }
  }

  private toCtx(s: Seg, sec: number): number {
    for (const p of s.pieces) if (sec <= p.sec + p.dur) return p.at + Math.max(0, sec - p.sec)
    return s.next
  }

  private toSec(s: Seg, t: number): number {
    let out = s.lead
    for (const p of s.pieces) {
      if (t < p.at) break
      out = p.sec + Math.min(p.dur, t - p.at)
    }
    return out
  }

  private pump() {
    if (this.dead) return
    const ctx = this.ctx
    const now = ctx.currentTime
    // 時計が止まったら(タブの音が止められた等)待ち続けない
    if (now !== this.stall.t) this.stall = { t: now, since: performance.now() }
    else if (performance.now() - this.stall.since > 1500 && this.segs.size) {
      log("clock stalled", ctx.state)
      return this.kill()
    }
    for (;;) {
      const s = this.segs.get(this.active)
      if (!s) break
      if (!s.started) {
        const ready =
          s.complete || s.queuedSec >= START_SEC || (s.firstAt > 0 && performance.now() - s.firstAt > START_WAIT_MS)
        if (!ready || (s.silentSec === null && !s.queued.length && !s.complete)) break
        if (s.silentSec === null && !s.queued.length && s.complete && !s.receivedSec) {
          // 声が 1 つも届かなかった文は、字の速さの扱いにする
          s.silentSec = 0
        }
        this.startSeg(s)
      }
      if (s.silentSec === null) this.schedule(s)
      if (!s.complete) break
      if (s.t1 === null) this.finishSeg(s)
      const t1 = s.t1 ?? now
      const gap = /[。！？!?」』]$/.test(s.text.trim()) ? GAP_AFTER_SENTENCE : GAP_AFTER_CLAUSE
      this.lastEnd = t1 + (s.silentSec === null ? gap : 0)
      this.active++
    }
    if (this.closed && !this.segs.has(this.active) && now >= this.lastEnd - 0.05) {
      if (this.timer) clearInterval(this.timer)
      this.dead = true
      this.onDead(this)
      this.resolveFinished()
    }
  }

  now(): TrackState {
    const t = this.ctx.currentTime
    let done = 0
    for (;;) {
      const s = this.segs.get(done)
      if (!s || !s.started || s.t1 === null || t < s.t1) break
      done++
    }
    const s = this.segs.get(done)
    const finished = this.dead
    if (!s || !s.started || t < s.t0 || finished) return { playing: null, frac: 0, sounding: false, done, finished }
    if (s.silentSec !== null) {
      const frac = s.silentSec > 0 ? Math.min(1, (t - s.t0) / s.silentSec) : 1
      return { playing: done, frac, sounding: false, done, finished }
    }
    const sec = this.toSec(s, t)
    const end = s.t1 !== null ? this.toSec(s, s.t1) : null
    return { playing: done, frac: voicedFrac(s, sec, end), sounding: true, done, finished }
  }
}

/** 声の出ている時間のうち、sec までに鳴った割合 */
function voicedFrac(s: Seg, sec: number, end: number | null): number {
  const thr = silenceThreshold(s.rms)
  const pauseWin = Math.round(PAUSE_SEC / WIN_SEC)
  const from = Math.floor(s.lead / WIN_SEC)
  const upto = Math.floor(sec / WIN_SEC)
  const last = end !== null ? Math.min(s.rms.length, Math.ceil(end / WIN_SEC)) : s.rms.length
  let voiced = 0
  let total = 0
  let quiet = 0
  for (let i = from; i < last; i++) {
    if (s.rms[i] > thr) {
      // 短い無音(子音の溜めなど)は声の内に数える
      if (quiet && quiet < pauseWin) {
        total += quiet
        if (i <= upto) voiced += quiet
      }
      quiet = 0
      total++
      if (i < upto) voiced++
    } else quiet++
  }
  if (!total) return end !== null ? Math.min(1, (sec - s.lead) / Math.max(0.1, end - s.lead)) : 0
  // まだ全部届いていない文は、字の数から長さを見積もって大きい方を取る(早く進みすぎない)
  if (end === null) total = Math.max(total, (s.text.length * 0.14) / WIN_SEC)
  return Math.min(1, voiced / total)
}

/** 無音とみなす大きさ。声の大きい側(上位 10%)の 6%(Gemini の stream の声で、読点の間が取れた値。2026-11-26) */
const thrCache = new WeakMap<number[], { n: number; thr: number }>()
function silenceThreshold(rms: number[]): number {
  if (!rms.length) return 0.001
  const hit = thrCache.get(rms)
  if (hit && hit.n === rms.length) return hit.thr
  const sorted = [...rms].sort((a, b) => a - b)
  const thr = Math.max(0.0005, sorted[Math.floor(sorted.length * 0.9)] * 0.06)
  thrCache.set(rms, { n: rms.length, thr })
  return thr
}

function pcm16(b64: string): Float32Array {
  const bin = atob(b64)
  const n = Math.floor(bin.length / 2)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let v = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8)
    if (v >= 0x8000) v -= 0x10000
    out[i] = v / 32768
  }
  return out
}

function concat(parts: Float32Array[]): Float32Array {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

export class AvatarVoice {
  private ctx: AudioContext | null = null
  private out: AudioNode | null = null
  private tracks = new Set<VoiceTrack>()
  private cache = new Map<string, Promise<AudioBuffer | null>>()

  get state(): string {
    return this.ctx?.state ?? "none"
  }

  /** 押した操作の中で呼ぶ。作って resume し、無音を 1 つ鳴らして出力を開く */
  unlock() {
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        this.ctx = new Ctx()
        this.ctx.onstatechange = () => log("state", this.ctx?.state)
        // 音量を寄せた後の頭打ち(stream の声は最初の 0.8 秒で音量を決めるので、後で大きい所が来ても割れないように)
        const limiter = this.ctx.createDynamicsCompressor()
        limiter.threshold.value = -3
        limiter.knee.value = 0
        limiter.ratio.value = 20
        limiter.attack.value = 0.002
        limiter.release.value = 0.15
        limiter.connect(this.ctx.destination)
        this.out = limiter
      }
      const ctx = this.ctx
      void ctx.resume().then(() => log("resumed", ctx.state, "rate", ctx.sampleRate))
      const s = ctx.createBufferSource()
      s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
      s.connect(ctx.destination)
      s.start()
    } catch (e) {
      log("unlock failed", e)
    }
  }

  /** running でなければ resume を 0.6 秒だけ待つ。だめなら false(鳴らさず進める) */
  async ready(): Promise<boolean> {
    const ctx = this.ctx
    if (!ctx) return false
    if (ctx.state !== "running") {
      await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, 600))])
    }
    if (ctx.state !== "running") log("not running:", ctx.state)
    return ctx.state === "running"
  }

  /** 答え 1 つ分の声の並び。AudioContext が無ければ null(呼ぶ側は声なしで進める) */
  track(): VoiceTrack | null {
    if (!this.ctx || !this.out) return null
    const t = new VoiceTrack(this.ctx, this.out, (x) => this.tracks.delete(x))
    this.tracks.add(t)
    return t
  }

  /** 前もって合成した声を読む(同じ URL は 1 回だけ) */
  load(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return Promise.resolve(null)
    let p = this.cache.get(url)
    if (!p) {
      const ctx = this.ctx
      p = fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`${r.status}`)
          return r.arrayBuffer()
        })
        .then((b) => ctx.decodeAudioData(b))
        .catch((e) => {
          log("load failed", url, String(e))
          return null
        })
      this.cache.set(url, p)
    }
    return p
  }

  /** 旧形式の audio(1 文まるごと、base64)。RIFF でなければ 24kHz・mono・16bit の PCM */
  async decode(mime: string, base64: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null
    try {
      if (mime.includes("wav") || base64.startsWith("UklGR")) {
        const bin = atob(base64)
        const bytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
        return trimSilence(await this.ctx.decodeAudioData(bytes.buffer))
      }
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000)
      const pcm = pcm16(base64)
      const buf = this.ctx.createBuffer(1, pcm.length, rate)
      buf.copyToChannel(pcm as Float32Array<ArrayBuffer>, 0)
      return trimSilence(buf)
    } catch (e) {
      log("decode failed", String(e))
      return null
    }
  }

  get busy() {
    return this.tracks.size > 0
  }

  /** 鳴っている物と順番待ちを全部捨てる */
  stop() {
    for (const t of [...this.tracks]) t.kill()
    this.tracks.clear()
  }
}

function normalizeGain(ch: Float32Array): number {
  let sum = 0
  let n = 0
  let peak = 0
  for (let i = 0; i < ch.length; i++) {
    const v = Math.abs(ch[i])
    if (v > peak) peak = v
    if (v > 0.005) {
      sum += v * v
      n++
    }
  }
  if (!n || !peak) return 1
  const rms = Math.sqrt(sum / n)
  return Math.min(TARGET_RMS / rms, PEAK_CAP / peak, 12)
}

/** 先頭の無音を落とし、1.5 秒以上の無音が来たらそこで切る(Gemini の一括の声は末尾に 20 秒前後の無音が付くことがある) */
function trimSilence(buf: AudioBuffer): AudioBuffer {
  const ch = buf.getChannelData(0)
  const rate = buf.sampleRate
  let peak = 0
  for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]))
  // 声が小さい(peak 0.05 前後)ので、しきい値は声の大きさに合わせる
  const thr = Math.max(0.002, peak * 0.06)
  const win = Math.floor(rate / 50)
  const loud = (i: number) => {
    for (let j = i; j < Math.min(ch.length, i + win); j++) if (Math.abs(ch[j]) > thr) return true
    return false
  }
  let first = 0
  while (first < ch.length && !loud(first)) first += win
  if (first >= ch.length) return buf
  let last = first
  let quiet = 0
  for (let i = first; i < ch.length; i += win) {
    if (loud(i)) {
      last = i
      quiet = 0
    } else if ((quiet += win) >= rate * 1.5) break
  }
  const s = Math.max(0, first - Math.floor(rate / 20))
  const e = Math.min(ch.length, last + win + Math.floor(rate / 8))
  if (s === 0 && e === ch.length) return buf
  const out = new AudioBuffer({ length: e - s, numberOfChannels: 1, sampleRate: rate })
  out.copyToChannel(ch.subarray(s, e), 0)
  return out
}
