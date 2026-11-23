// 分身の声。Web Audio で順に鳴らす。
// - AudioContext は押した操作(分身を呼ぶ・聞く・音を出す)の中で作って resume する。ブラウザは押される前の音を止める
// - 鳴らす前に running になっているか確かめ、ならなければ鳴らさずに進める(待ち続けない)
// - 1 本ごとに「長さ+0.6 秒」で必ず終わった扱いにする(onended が来なくても止まらない)
// - stop() で鳴っている物も順番待ちの物も全部捨てる。次の質問や「止める」はこれを呼ぶ
// 調べやすいよう、状態の変わり目を console.info("[avatar-voice] …") に出す

const TARGET_RMS = 0.11 // 約 -19 dBFS。その場の声(Gemini の出力は約 -40 LUFS と小さい)を前もって合成した声(-16 LUFS)にそろえる
const PEAK_CAP = 0.85

const log = (...args: unknown[]) => console.info("[avatar-voice]", ...args)

export class AvatarVoice {
  private ctx: AudioContext | null = null
  private gen = 0
  private queue: Promise<void> = Promise.resolve()
  private live = new Set<{ src: AudioBufferSourceNode; done: () => void }>()
  private pending = 0
  private cache = new Map<string, Promise<AudioBuffer | null>>()
  /** 出力へ流れた音の大きさを測る(記録用。鳴っている間の最大の振幅を play の終わりに console へ出す) */
  private meter: AnalyserNode | null = null

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
      }
      const ctx = this.ctx
      if (!this.meter) {
        this.meter = ctx.createAnalyser()
        this.meter.fftSize = 2048
      }
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

  /** Worker から届いた声(base64)。RIFF でなければ 24kHz・mono・16bit の PCM */
  async decode(mime: string, base64: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    try {
      if (mime.includes("wav") || (bytes[0] === 0x52 && bytes[1] === 0x49)) {
        return trimSilence(await this.ctx.decodeAudioData(bytes.buffer))
      }
      const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000)
      const n = Math.floor(bytes.length / 2)
      const buf = this.ctx.createBuffer(1, n, rate)
      const ch = buf.getChannelData(0)
      const view = new DataView(bytes.buffer)
      for (let i = 0; i < n; i++) ch[i] = view.getInt16(i * 2, true) / 32768
      return trimSilence(buf)
    } catch (e) {
      log("decode failed", String(e))
      return null
    }
  }

  /** 順番に鳴らす。鳴り終わる(か stop される)と解決する */
  enqueue(buffer: AudioBuffer, opts: { normalize?: boolean } = {}): Promise<void> {
    const gen = this.gen
    this.pending++
    const job = this.queue.then(
      () =>
        new Promise<void>((resolve) => {
          const ctx = this.ctx
          if (!ctx || gen !== this.gen) return resolve()
          const src = ctx.createBufferSource()
          src.buffer = buffer
          const gain = ctx.createGain()
          gain.gain.value = opts.normalize ? normalizeGain(buffer) : 0.9 // 前もって合成した声は peak 1.03 まで出たので少し下げる
          src.connect(gain).connect(ctx.destination)
          const meter = this.meter
          if (meter) gain.connect(meter)
          let peak = 0
          const sample = new Float32Array(2048)
          const probe = setInterval(() => {
            if (!meter) return
            meter.getFloatTimeDomainData(sample)
            for (const v of sample) peak = Math.max(peak, Math.abs(v))
          }, 50)
          let finished = false
          const entry = {
            src,
            done: () => {
              if (finished) return
              finished = true
              clearTimeout(guard)
              clearInterval(probe)
              try {
                if (meter) gain.disconnect(meter)
              } catch {}
              log("ended", "out peak", peak.toFixed(3))
              this.live.delete(entry)
              resolve()
            },
          }
          const guard = setTimeout(entry.done, (buffer.duration + 0.6) * 1000)
          src.onended = entry.done
          this.live.add(entry)
          src.start()
          log("play", buffer.duration.toFixed(2) + "s", "gain", gain.gain.value.toFixed(2), "state", ctx.state)
        })
    )
    const tracked = job.finally(() => {
      this.pending = Math.max(0, this.pending - 1)
    })
    this.queue = tracked
    return tracked
  }

  get busy() {
    return this.pending > 0
  }

  /** 鳴っている物と順番待ちを全部捨てる */
  stop() {
    this.gen++
    for (const e of [...this.live]) {
      try {
        e.src.stop()
      } catch {}
      e.done()
    }
    this.live.clear()
    this.queue = Promise.resolve()
    this.pending = 0
  }
}

function normalizeGain(buf: AudioBuffer): number {
  const ch = buf.getChannelData(0)
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

/** 先頭の無音を落とし、1.5 秒以上の無音が来たらそこで切る(Gemini の声は末尾に 20 秒前後の無音が付くことがある) */
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
