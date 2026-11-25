// 分身の姿の再生。緑一色の背景で焼いた型の動画(全部が中立の姿勢で始まり中立で終わる)を、
// <video> 2 枚の重ね替えでつなぎ、WebGL で緑を抜いて canvas に描く。
// 透過の動画(WebM の alpha と Safari の HEVC alpha の 2 本)を持たずに済み、どのブラウザでも同じに見える。
// 口は後から重ねない(本人 2026-11-24「後付けでは絶対合わない」)。話す間は、口も体も動画の中で動いている talk_1 の型を流す。
// talk_1 は Flow の talk_m2(手を下ろしたまま話す方)を 640x660 に切った物。前の talk_m1 は i2v が元の絵に無い
// パーカーの紐を描き足し、手を胸の前で大きく動かすので、話している間に紐が出て、途中で待機へ溶かすと腕が二重に残った(本人 2026-11-25)。

export type ClipId = "idle_1" | "talk_1" | "point_l_2" | "point_r_2" | "bow_1"

// 各型で、中立の姿勢(idle_1 の最初のコマ)に近いコマの範囲(秒)。緑を抜いたアルファで片方にだけ人がいる所を、
// 幅 7px の開きで細い縁のずれを落として数え、全画素の 0.3% 以下のコマが 3 つ以上続く所(2026-11-25 実測)。
// 型の動画を差し替えたら測り直す。ここに無い型は、どこで切っても待たない
const NEAR: Partial<Record<ClipId, [number, number][]>> = {
  idle_1: [[0, 1.58], [3.67, 7.96]],
  talk_1: [[0, 0.25], [2.5, 2.96], [5.12, 7.96]],
  point_l_2: [[0, 0.29], [3.96, 5.96]],
  point_r_2: [[0, 0.33], [4.25, 5.96]],
  bow_1: [[0, 0.54], [3.58, 5.96]],
}
/**
 * 離れるときに待たない型。待機から話す・指すへ移るのを遅らせると、声が先に出て口が閉じたままになる。
 * 待機の揺れ(1.6〜3.7 秒で少し傾く)は腕ほど離れないので、そこで切るときは短く溶かして二重に見える時間を縮める
 */
const NO_WAIT: ClipId[] = ["idle_1"]

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
}

export class AvatarPlayer {
  private gl: WebGLRenderingContext
  private slots: [Slot, Slot]
  private front = 0
  private fade: { start: number; ms: number } | null = null
  private raf = 0
  private disposed = false

  /** 重ね替えにかける時間。中立の姿勢どうしなので短くてよい */
  static FADE_MS = 280
  /**
   * 途中で切り上げるとき、中立に近いコマまで待つ上限(秒、ふつうの速さで)。これより遠ければ速く回して届かせる。
   * 違う姿勢どうしを溶かすと、片方にだけ在る腕や頭が半分透けて二重に見える(残像。本人 2026-11-25)ので、溶かさずに待つ。
   * 1.2 秒は guide が話し終えた後に話す型を最後まで流す長さと同じ
   */
  static CUT_WAIT_S = 1.2
  /** 待つ間に速く回すときの上限の倍率 */
  static CUT_MAX_RATE = 2
  /** 待たない型を中立から離れたコマで切るときの溶かし(3 コマ) */
  static QUICK_FADE_MS = 120

  constructor(
    private canvas: HTMLCanvasElement,
    private base: string,
    private hooks: PlayerHooks
  ) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) throw new Error("webgl_unavailable")
    this.gl = gl
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
      s.video.playbackRate = 1
      s.video.src = this.src(clip)
      s.video.currentTime = 0
      s.video.load()
    })
  }

  /** 今の型の途中でも次へ移る(話し終えたとき)。残りが短ければ終わりまで待つ */
  private pending: ClipId | null = null
  private switching = false
  /** 途中で切り上げる先と、そこへ移る今の型の時刻(中立に近いコマの始まり) */
  private cutAt: { clip: ClipId; t: number } | null = null

  /**
   * cut は今の型の途中でも移る。ただし今の型が中立から離れたコマなら、近いコマまで待ってから溶かす
   * (待つ間は戻り値を待たせない。呼ぶ側は声などを先に進めてよい)
   */
  async switchTo(clip: ClipId, opts: { cut?: boolean } = {}) {
    if (this.switching) {
      this.pending = clip
      return
    }
    const cur = this.slots[this.front]
    const left = cur.video.duration - cur.video.currentTime
    if (!opts.cut && Number.isFinite(left) && left > AvatarPlayer.FADE_MS / 1000 + 0.05) {
      this.pending = clip
      if (this.cutAt) this.cutAt.clip = clip
      return
    }
    let ms = AvatarPlayer.FADE_MS
    if (opts.cut && cur.clip) {
      const t = this.nearFrom(cur.clip, cur.video.currentTime)
      if (t !== null && NO_WAIT.includes(cur.clip)) ms = AvatarPlayer.QUICK_FADE_MS
      else if (t !== null) {
        const wait = t - cur.video.currentTime
        this.cutAt = { clip, t }
        // 型の終わりが先に来ても同じ先へ移る
        this.pending = clip
        cur.video.playbackRate = Math.min(AvatarPlayer.CUT_MAX_RATE, Math.max(1, wait / AvatarPlayer.CUT_WAIT_S))
        return
      }
    }
    this.cutAt = null
    await this.crossfade(clip, ms)
  }

  /** clip の時刻 now から見て、中立に近いコマの始まり(秒)。今が近いか、表に無い型なら null */
  private nearFrom(clip: ClipId, now: number): number | null {
    const spans = NEAR[clip]
    if (!spans) return null
    for (const [a, b] of spans) {
      // 次の型を読み込む間(手元で 0.1〜0.15 秒)と溶かし終えるまで範囲の中に居られるなら、今すぐでよい
      if (now >= a && now <= b - (AvatarPlayer.FADE_MS + 150) / 1000) return null
      if (a > now) return a
    }
    return null
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
    this.cutAt = null
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
    // 途中で切り上げる先があり、中立に近いコマまで来たら移る
    if (!this.switching && this.cutAt && cur.video.currentTime >= this.cutAt.t) {
      const { clip } = this.cutAt
      this.cutAt = null
      this.pending = null
      cur.video.playbackRate = 1
      void this.crossfade(clip, AvatarPlayer.FADE_MS)
    }
    // 終わりが近づいたら次の型へ(指示が無ければ同じ型を頭から)
    if (!this.switching && cur.clip && Number.isFinite(cur.video.duration)) {
      const left = cur.video.duration - cur.video.currentTime
      if (left <= AvatarPlayer.FADE_MS / 1000 + 0.04) {
        const next = this.pending ?? this.hooks.next(cur.clip) ?? cur.clip
        this.pending = null
        cur.video.playbackRate = 1
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
