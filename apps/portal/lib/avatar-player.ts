// 分身の姿の再生。緑一色の背景で焼いた型の動画(全部が中立の姿勢で始まり中立で終わる)を、
// <video> 2 枚の重ね替えでつなぎ、WebGL で緑を抜いて canvas に描く。
// 透過の動画(WebM の alpha と Safari の HEVC alpha の 2 本)を持たずに済み、どのブラウザでも同じに見える。
// 口は別の 2D canvas に重ねる(口の位置は動画ごとに前もって追跡した mouth.json)。

export type ClipId = "idle_1" | "talk_1" | "point_l_2" | "point_r_2" | "bow_1"

export type MouthTrack = {
  crop: [number, number, number, number]
  fps: number
  mouthW: number
  clips: Record<string, [number, number, number][]>
}

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2((p.x + 1.0) * 0.5, 1.0 - (p.y + 1.0) * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`

// 緑の強さ(g - max(r, b))で透明度を決め、縁に残る緑のにじみは g を max(r, b) に寄せて消す。
// 2 枚を mixT で重ねる(どちらも抜いた後の色で、premultiplied で混ぜる)
const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D a;
uniform sampler2D b;
uniform float mixT;
uniform float hasB;
vec4 keyed(vec4 c) {
  float spill = c.g - max(c.r, c.b);
  float alpha = 1.0 - smoothstep(0.12, 0.32, spill);
  vec3 rgb = c.rgb;
  rgb.g = min(rgb.g, max(rgb.r, rgb.b) + 0.04);
  return vec4(rgb * alpha, alpha);
}
void main() {
  vec4 ca = keyed(texture2D(a, uv));
  vec4 cb = keyed(texture2D(b, uv));
  gl_FragColor = mix(ca, cb, mixT * hasB);
}`

type Slot = { video: HTMLVideoElement; clip: ClipId | null; tex: WebGLTexture }

export type PlayerHooks = {
  /** 今の型が終わりに近づいたとき、次の型を決める。null なら同じ型を繰り返す */
  next: (current: ClipId) => ClipId | null
  /** 口の開き(0〜1)。毎コマ読む */
  mouth: () => number
}

export class AvatarPlayer {
  private gl: WebGLRenderingContext
  private slots: [Slot, Slot]
  private front = 0
  private fade: { start: number; ms: number } | null = null
  private raf = 0
  private mouthCtx: CanvasRenderingContext2D
  private disposed = false

  /** 重ね替えにかける時間。中立の姿勢どうしなので短くてよい */
  static FADE_MS = 280
  /** 途中で切り上げるとき(話し終えたのに話す型が長く残る)は長めに溶かす */
  static CUT_FADE_MS = 520

  constructor(
    private canvas: HTMLCanvasElement,
    private mouthCanvas: HTMLCanvasElement,
    private base: string,
    private track: MouthTrack,
    private hooks: PlayerHooks
  ) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) throw new Error("webgl_unavailable")
    this.gl = gl
    this.mouthCtx = mouthCanvas.getContext("2d")!
    const prog = this.program()
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "p")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1i(gl.getUniformLocation(prog, "a"), 0)
    gl.uniform1i(gl.getUniformLocation(prog, "b"), 1)
    this.uMix = gl.getUniformLocation(prog, "mixT")
    this.uHasB = gl.getUniformLocation(prog, "hasB")
    this.slots = [this.slot(), this.slot()]
  }

  private uMix: WebGLUniformLocation | null
  private uHasB: WebGLUniformLocation | null

  private program() {
    const gl = this.gl
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(p)
    return p
  }

  private slot(): Slot {
    const video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.preload = "auto"
    video.crossOrigin = "anonymous"
    video.setAttribute("aria-hidden", "true")
    const gl = this.gl
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return { video, clip: null, tex }
  }

  private src(clip: ClipId) {
    return `${this.base}/${clip}.mp4`
  }

  /** 全部の型を先に読み込む(1 本 0.4〜0.5MB)。2 枚目からはキャッシュから出る */
  async preload(clips: ClipId[]) {
    await Promise.all(
      clips.map((c) => fetch(this.src(c), { cache: "force-cache" }).then((r) => r.blob()).catch(() => null))
    )
  }

  async start(clip: ClipId) {
    const s = this.slots[this.front]
    await this.load(s, clip)
    await s.video.play().catch(() => {})
    this.loop()
  }

  private load(s: Slot, clip: ClipId): Promise<void> {
    return new Promise((resolve) => {
      s.clip = clip
      const done = () => {
        s.video.removeEventListener("canplay", done)
        resolve()
      }
      s.video.addEventListener("canplay", done)
      s.video.src = this.src(clip)
      s.video.currentTime = 0
      s.video.load()
    })
  }

  /** 今の型の途中でも次へ移る(話し終えたとき)。残りが短ければ終わりまで待つ */
  private pending: ClipId | null = null
  private switching = false

  async switchTo(clip: ClipId, opts: { cut?: boolean } = {}) {
    if (this.switching) {
      this.pending = clip
      return
    }
    const cur = this.slots[this.front]
    const left = cur.video.duration - cur.video.currentTime
    if (!opts.cut && Number.isFinite(left) && left > AvatarPlayer.FADE_MS / 1000 + 0.05) {
      this.pending = clip
      return
    }
    await this.crossfade(clip, opts.cut ? AvatarPlayer.CUT_FADE_MS : AvatarPlayer.FADE_MS)
  }

  get current(): ClipId | null {
    return this.slots[this.front].clip
  }

  /** 今の型の、終わりまでの秒 */
  get remaining(): number {
    const v = this.slots[this.front].video
    return Number.isFinite(v.duration) ? v.duration - v.currentTime : 0
  }

  private async crossfade(clip: ClipId, ms: number) {
    this.switching = true
    const back = this.slots[1 - this.front]
    await this.load(back, clip)
    await back.video.play().catch(() => {})
    this.fade = { start: performance.now(), ms }
    await new Promise((r) => setTimeout(r, ms))
    this.slots[this.front].video.pause()
    this.front = 1 - this.front
    this.fade = null
    this.switching = false
  }

  private loop = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    const cur = this.slots[this.front]
    // 終わりが近づいたら次の型へ(指示が無ければ同じ型を頭から)
    if (!this.switching && cur.clip && Number.isFinite(cur.video.duration)) {
      const left = cur.video.duration - cur.video.currentTime
      if (left <= AvatarPlayer.FADE_MS / 1000 + 0.04) {
        const next = this.pending ?? this.hooks.next(cur.clip) ?? cur.clip
        this.pending = null
        void this.crossfade(next, AvatarPlayer.FADE_MS)
      }
    }
    this.draw()
  }

  private upload(s: Slot, unit: number) {
    const gl = this.gl
    gl.activeTexture(unit === 0 ? gl.TEXTURE0 : gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, s.tex)
    if (s.video.readyState >= 2) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.video)
    }
  }

  private draw() {
    const gl = this.gl
    const { width, height } = this.canvas
    gl.viewport(0, 0, width, height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const a = this.slots[this.front]
    const b = this.slots[1 - this.front]
    this.upload(a, 0)
    let t = 0
    if (this.fade) {
      this.upload(b, 1)
      t = Math.min(1, (performance.now() - this.fade.start) / this.fade.ms)
    }
    gl.uniform1f(this.uMix, t)
    gl.uniform1f(this.uHasB, this.fade ? 1 : 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    this.drawMouth(t > 0.5 ? b : a)
  }

  // 口は話す型と待機の型のときだけ重ねる(指す・お辞儀は顔が横や下を向き、正面の口が合わない)
  private drawMouth(s: Slot) {
    const ctx = this.mouthCtx
    const { width, height } = this.mouthCanvas
    ctx.clearRect(0, 0, width, height)
    if (!s.clip || (s.clip !== "talk_1" && s.clip !== "idle_1")) return
    const open = this.hooks.mouth()
    if (open < 0.12) return
    const pts = this.track.clips[s.clip]
    const f = Math.min(pts.length - 1, Math.floor(s.video.currentTime * this.track.fps))
    const [x, y, score] = pts[f] ?? [0, 0, 0]
    if (score < 0.42) return
    const [, , cw, ch] = this.track.crop
    const sx = width / cw
    const sy = height / ch
    // 動画の閉じた口の線(幅 約 21px)の上に、開いた口を描く。開きは 2 段(半開き・開き)
    const level = open < 0.45 ? 0.5 : 1
    const w = this.track.mouthW * (0.55 + 0.15 * level) * sx
    const h = (2.2 + 4.2 * level) * sy
    const cx = x * sx
    const cy = (y + 0.6) * sy
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(cx, cy + h * 0.25, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.fillStyle = "#5b2a2c"
    ctx.fill()
    // 舌の明るさを下半分に少し
    ctx.beginPath()
    ctx.ellipse(cx, cy + h * 0.5, w * 0.3, h * 0.22, 0, 0, Math.PI * 2)
    ctx.fillStyle = "#b8616a"
    ctx.globalAlpha = level
    ctx.fill()
    ctx.restore()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    for (const s of this.slots) {
      s.video.pause()
      s.video.removeAttribute("src")
      s.video.load()
    }
  }
}
