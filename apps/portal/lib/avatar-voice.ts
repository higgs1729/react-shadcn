// 分身の声と口の開き。声は Web Audio で鳴らし、AnalyserNode の音量から口の開き(0〜1)を出す。
// 音を出さない人(既定)には、字の長さから見積もった時間だけ、決まった揺れで口を動かす。
// AudioContext は「音を出す」を押した操作の中でだけ作る(ブラウザは押される前の音を止める)。

const TARGET_RMS = 0.11 // 約 -19 dBFS。前もって合成した声(-16 LUFS)と、その場の声の大きさをそろえる
const PEAK_CAP = 0.85

export class AvatarVoice {
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private data = new Float32Array(512)
  private queue: Promise<void> = Promise.resolve()
  private playing = 0
  private sources = new Set<AudioBufferSourceNode>()
  private fake: { until: number; start: number } | null = null
  private smooth = 0
  private cache = new Map<string, Promise<AudioBuffer | null>>()

  get unlocked() {
    return this.ctx !== null && this.ctx.state === "running"
  }

  /** 押した操作の中で呼ぶ */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 1024
      this.analyser.connect(this.ctx.destination)
    }
    void this.ctx.resume()
  }

  /** 前もって合成した声を読む(同じ URL は 1 回だけ) */
  load(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return Promise.resolve(null)
    let p = this.cache.get(url)
    if (!p) {
      const ctx = this.ctx
      p = fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b))
        .catch(() => null)
      this.cache.set(url, p)
    }
    return p
  }

  /** Worker から届いた声(base64)を AudioBuffer に。RIFF でなければ 24kHz・mono・16bit の PCM */
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
    } catch {
      return null
    }
  }

  /** 順番に鳴らす。鳴り終わったら解決する */
  enqueue(buffer: AudioBuffer, opts: { normalize?: boolean } = {}): Promise<void> {
    this.playing++
    const p = this.queue.then(
      () =>
        new Promise<void>((resolve) => {
          const ctx = this.ctx
          if (!ctx || !this.analyser) return resolve()
          const src = ctx.createBufferSource()
          src.buffer = buffer
          const gain = ctx.createGain()
          gain.gain.value = opts.normalize ? normalizeGain(buffer) : 1
          src.connect(gain).connect(this.analyser)
          this.sources.add(src)
          src.onended = () => {
            this.sources.delete(src)
            resolve()
          }
          src.start()
        })
    )
    this.queue = p.finally(() => {
      this.playing--
    })
    return this.queue
  }

  /** 音を出さないときの口の動き。字数から見積もった秒だけ動かす */
  pretend(chars: number) {
    const now = performance.now()
    const ms = Math.max(1200, chars * 140)
    const until = Math.max(this.fake?.until ?? 0, now) + ms
    this.fake = { start: this.fake?.start ?? now, until }
    return new Promise<void>((r) => setTimeout(r, until - now))
  }

  get busy() {
    return this.playing > 0 || (this.fake !== null && performance.now() < this.fake.until)
  }

  /** 今鳴っているものを止める */
  stop() {
    for (const s of this.sources) {
      try {
        s.stop()
      } catch {}
    }
    this.sources.clear()
    this.fake = null
  }

  /** 口の開き 0〜1 */
  level(): number {
    let raw = 0
    const now = performance.now()
    if (this.fake && now < this.fake.until) {
      // 音節の速さ(1 秒に 7〜8 回)で開け閉めし、ときどき閉じる
      const t = (now - this.fake.start) / 1000
      const syll = Math.max(0, Math.sin(t * 2 * Math.PI * 3.7))
      const phrase = Math.sin(t * 1.3) > -0.75 ? 1 : 0
      raw = syll * phrase * (0.55 + 0.45 * Math.abs(Math.sin(t * 5.1)))
    } else if (this.analyser && this.playing > 0) {
      this.analyser.getFloatTimeDomainData(this.data)
      let sum = 0
      for (let i = 0; i < this.data.length; i++) sum += this.data[i] * this.data[i]
      const rms = Math.sqrt(sum / this.data.length)
      raw = Math.min(1, Math.max(0, (rms - 0.012) * 9))
    }
    // 開くのは速く、閉じるのは少し遅く
    this.smooth += (raw - this.smooth) * (raw > this.smooth ? 0.6 : 0.3)
    return this.smooth
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
    if (v > 0.01) {
      sum += v * v
      n++
    }
  }
  if (!n || !peak) return 1
  const rms = Math.sqrt(sum / n)
  return Math.min(TARGET_RMS / rms, PEAK_CAP / peak, 8)
}

/** 先頭の無音を落とし、2 秒以上の無音が来たらそこで切る(Gemini の声は末尾に長い無音が付くことがある) */
function trimSilence(buf: AudioBuffer): AudioBuffer {
  const ch = buf.getChannelData(0)
  const rate = buf.sampleRate
  const win = Math.floor(rate / 50)
  const peakOf = (i: number) => {
    let m = 0
    for (let j = i; j < Math.min(ch.length, i + win); j++) m = Math.max(m, Math.abs(ch[j]))
    return m
  }
  const loud = (i: number) => peakOf(i) > 0.006
  let first = 0
  while (first < ch.length && !loud(first)) first += win
  if (first >= ch.length) return buf
  let last = first
  let quiet = 0
  for (let i = first; i < ch.length; i += win) {
    if (loud(i)) {
      last = i
      quiet = 0
    } else if ((quiet += win) >= rate * 2) break
  }
  const s = Math.max(0, first - Math.floor(rate / 20))
  const e = Math.min(ch.length, last + win + Math.floor(rate / 8))
  if (s === 0 && e === ch.length) return buf
  const out = new AudioBuffer({ length: e - s, numberOfChannels: 1, sampleRate: rate })
  out.copyToChannel(ch.subarray(s, e), 0)
  return out
}
