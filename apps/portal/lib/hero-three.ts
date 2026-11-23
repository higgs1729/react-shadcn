// ヒーローの 3D 版。2D の座標系（axis-figure.tsx）を奥行きのある形に起こし、
// 短冊（積分の面積）の前の面に、本人の作品の映像を映す。
//
// three はこのファイルだけが読む。hero-scene.tsx が動的 import するので、
// 3D を使わない環境（WebGL が無い）では落ちてこない。
//
// 形の数値は持たない。短冊・曲線・軸・ラベルは、サーバーが描いた 2D の SVG から読む。
// ここに写すと正本が二つになり、片方だけ直す事故が起きるため（axis-figure と同じ考え）。
//
// 映像は1本の横長の動画（アトラス）。幅を短冊の本数で等分し、i 本目の短冊の前の面に
// i 列目を貼る。14 本の動画を別々に回すより、デコードが1本で済むのでスマホでも軽い。
import * as THREE from "three"

export type HeroSceneOptions = {
  canvas: HTMLCanvasElement
  svg: SVGSVGElement
  video: HTMLVideoElement
  /** 最初の1枚を描いたときに1回だけ呼ぶ */
  onReady: () => void
}

export type HeroSceneHandle = { dispose: () => void }

// viewBox（0 0 1200 520）の中心を原点にし、y を上向きにする。
// 正面（yaw = pitch = 0）から見ると、z = 0 の面が 2D の図とちょうど重なる。
const VB_W = 1200
const VB_H = 520
const toX = (x: number) => x - VB_W / 2
const toY = (y: number) => VB_H / 2 - y

/** 短冊の奥行き。幅 71 に対して深すぎると、回したときに隣の映像を隠す */
const DEPTH = 46
/** 点が止まる短冊（2D と同じく左から5本目の真ん中） */
const STOP_BAR = 4
const FOV = 24

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const easeOut = (t: number) => 1 - (1 - t) ** 2

/** M/L/H/V/l/h/v だけの path を点の列にする。軸と矢印と曲線はこれで足りる */
function pathPoints(d: string): THREE.Vector2[] {
  const tokens = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+/g) ?? []
  const points: THREE.Vector2[] = []
  let x = 0
  let y = 0
  let cmd = "M"
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i]
    if (/[A-Za-z]/.test(token)) {
      cmd = token
      i++
      if (cmd === "Z" || cmd === "z") points.push(points[0].clone())
      continue
    }
    const n = (k: number) => Number(tokens[i + k])
    switch (cmd) {
      case "M":
      case "L":
        x = n(0)
        y = n(1)
        i += 2
        break
      case "l":
        x += n(0)
        y += n(1)
        i += 2
        break
      case "H":
        x = n(0)
        i += 1
        break
      case "h":
        x += n(0)
        i += 1
        break
      case "V":
        y = n(0)
        i += 1
        break
      case "v":
        y += n(0)
        i += 1
        break
      default:
        i += 1
    }
    points.push(new THREE.Vector2(x, y))
  }
  return points
}

function cssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return new THREE.Color(value || fallback)
}

function labelSprite(text: string, color: THREE.Color, size: number) {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (ctx) {
    const face = getComputedStyle(document.body).fontFamily
    ctx.fillStyle = `#${color.getHexString()}`
    ctx.font = `italic 44px ${face}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 32, 34)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  )
  sprite.scale.set(size * 1.4, size * 1.4, 1)
  return sprite
}

export function startHeroScene({
  canvas,
  svg,
  video,
  onReady,
}: HeroSceneOptions): HeroSceneHandle {
  const narrow = window.innerWidth < 768
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !narrow,
    alpha: true,
    powerPreference: "low-power",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, VB_W / VB_H, 10, 6000)
  const baseDistance = VB_H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))

  const accent = cssColor("--accent", "#c63307")
  const line = cssColor("--outline", "#cdd4dc")
  const ink = cssColor("--grey-600", "#6b7280")
  const dotColor = cssColor("--red-500", "#e0451a")

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item)
    return item
  }

  /* ---- 映像 ---- */
  const videoTexture = keep(new THREE.VideoTexture(video))
  videoTexture.colorSpace = THREE.SRGBColorSpace
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.generateMipmaps = false

  /* ---- 短冊 ---- */
  const rects = [...svg.querySelectorAll<SVGRectElement>(".bar")]
  const columns = rects.length
  const maxHeight = Math.max(...rects.map((r) => r.height.baseVal.value))
  const sideMaterial = keep(
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.14, depthWrite: false }),
  )
  const topMaterial = keep(
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.3, depthWrite: false }),
  )
  const edgeMaterial = keep(
    new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.5 }),
  )
  const bars = rects.map((rect, index) => {
    const x = rect.x.baseVal.value
    const y = rect.y.baseVal.value
    const w = rect.width.baseVal.value
    const h = rect.height.baseVal.value
    const geometry = keep(new THREE.BoxGeometry(w, h, DEPTH))
    geometry.translate(0, h / 2, -DEPTH / 2)

    // 前の面（BoxGeometry の 5 番目の面、頂点 16〜19）に、アトラスの i 列目を貼る。
    // 低い短冊は列の真ん中を切り出す。下端に寄せると、左の低い短冊が空ばかりになる。
    const uv = geometry.attributes.uv as THREE.BufferAttribute
    const u0 = index / columns
    const u1 = (index + 1) / columns
    const f = h / maxHeight
    const v0 = 0.5 - f / 2
    const v1 = 0.5 + f / 2
    for (let i = 16; i < 20; i++) {
      uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0))
    }
    uv.needsUpdate = true

    const front = keep(new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false }))
    const mesh = new THREE.Mesh(geometry, [
      sideMaterial,
      sideMaterial,
      topMaterial,
      sideMaterial,
      front,
      sideMaterial,
    ])
    mesh.position.set(toX(x + w / 2), toY(y + h), 0)
    const edges = new THREE.LineSegments(keep(new THREE.EdgesGeometry(geometry)), edgeMaterial)
    mesh.add(edges)
    mesh.scale.y = 0.0001
    scene.add(mesh)
    return { mesh, centerX: x + w / 2 }
  })

  /* ---- 曲線と点 ---- */
  const curvePath = svg.querySelector<SVGPathElement>(".axis__curve")
  const curve2d = curvePath ? pathPoints(curvePath.getAttribute("d") ?? "") : []
  const curve3d = curve2d.map((p) => new THREE.Vector3(toX(p.x), toY(p.y), 0.5))
  const curveGeometry = keep(new THREE.BufferGeometry().setFromPoints(curve3d))
  const curveLine = new THREE.Line(curveGeometry, keep(new THREE.LineBasicMaterial({ color: ink })))
  curveGeometry.setDrawRange(0, 0)
  scene.add(curveLine)

  // 弧長の累積。点を曲線の上で動かし、5本目の短冊の真ん中で止めるのに使う
  const lengths = [0]
  for (let i = 1; i < curve3d.length; i++) {
    lengths.push(lengths[i - 1] + curve3d[i].distanceTo(curve3d[i - 1]))
  }
  const total = lengths[lengths.length - 1] || 1
  const stopX = bars[STOP_BAR]?.centerX ?? curve2d[curve2d.length - 1]?.x ?? 0
  const stopLength = (() => {
    for (let i = 1; i < curve2d.length; i++) {
      if (curve2d[i].x >= stopX) {
        const t = (stopX - curve2d[i - 1].x) / (curve2d[i].x - curve2d[i - 1].x || 1)
        return lengths[i - 1] + t * (lengths[i] - lengths[i - 1])
      }
    }
    return total
  })()
  const pointAt = (length: number, out: THREE.Vector3) => {
    let i = 1
    while (i < lengths.length - 1 && lengths[i] < length) i++
    const t = (length - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1)
    return out.lerpVectors(curve3d[i - 1], curve3d[i], clamp01(t))
  }
  const dot = new THREE.Mesh(
    keep(new THREE.SphereGeometry(6.5, 20, 14)),
    keep(new THREE.MeshBasicMaterial({ color: dotColor })),
  )
  scene.add(dot)

  /* ---- 軸・矢印・ラベル ---- */
  const lineMaterial = keep(new THREE.LineBasicMaterial({ color: line }))
  for (const path of svg.querySelectorAll<SVGPathElement>(".axis__lines path")) {
    const pts = pathPoints(path.getAttribute("d") ?? "").map((p) => new THREE.Vector3(toX(p.x), toY(p.y), 0))
    scene.add(new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(pts)), lineMaterial))
  }
  const headMaterial = keep(new THREE.MeshBasicMaterial({ color: line, side: THREE.DoubleSide }))
  for (const path of svg.querySelectorAll<SVGPathElement>(".axis__heads path")) {
    const pts = pathPoints(path.getAttribute("d") ?? "")
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(toX(p.x), toY(p.y))))
    scene.add(new THREE.Mesh(keep(new THREE.ShapeGeometry(shape)), headMaterial))
  }
  for (const text of svg.querySelectorAll<SVGTextElement>(".axis__labels text")) {
    const sprite = labelSprite(text.textContent ?? "", ink, 20)
    disposables.push(sprite.material, sprite.material.map as THREE.Texture)
    const x = Number(text.getAttribute("x"))
    const y = Number(text.getAttribute("y"))
    sprite.position.set(toX(x + 6), toY(y - 7), 0)
    scene.add(sprite)
  }

  /* ---- 寸法 ---- */
  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  /* ---- 指の位置で少しだけ回す（マウスのある画面だけ） ---- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const finePointer = window.matchMedia("(pointer: fine)").matches
  const onPointer = (event: PointerEvent) => {
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
  }
  if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true })

  /* ---- 動き ----
     2D と同じ順で積み上げてから、正面の図を斜めに起こして奥行きを見せる。
       0.0〜1.6 s  曲線を引く・点が走る
       0.45 s〜    短冊が左から立つ
       2.0〜3.6 s  正面から斜めへ回る
       以降        ゆっくり揺れる                                        */
  const target = new THREE.Vector3(0, 0, -DEPTH / 2)
  const dotPosition = new THREE.Vector3()
  let start = -1
  let raf = 0
  let running = false
  let readySent = false

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (start < 0) start = now
    const t = (now - start) / 1000

    const drawn = easeInOut(clamp01(t / 1.6))
    curveGeometry.setDrawRange(0, Math.max(2, Math.ceil(drawn * curve3d.length)))
    dot.position.copy(pointAt(stopLength * drawn, dotPosition))

    bars.forEach(({ mesh }, i) => {
      const k = easeOut(clamp01((t - 0.45 - i * 0.045) / 0.5))
      mesh.scale.y = Math.max(0.0001, k)
    })

    const turn = easeInOut(clamp01((t - 2) / 1.6))
    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05
    const idle = turn * Math.min(1, Math.max(0, t - 3.6))
    const yaw = -0.36 * turn + idle * (Math.sin(t * 0.25) * 0.05 + pointer.x * 0.07)
    const pitch = 0.17 * turn + idle * (Math.sin(t * 0.19) * 0.02 - pointer.y * 0.03)
    const distance = baseDistance * (1 + 0.12 * turn)
    camera.position.set(
      target.x + distance * Math.sin(yaw) * Math.cos(pitch),
      target.y + distance * Math.sin(pitch),
      target.z + distance * Math.cos(yaw) * Math.cos(pitch),
    )
    camera.lookAt(target)

    renderer.render(scene, camera)
    if (!readySent) {
      readySent = true
      onReady()
    }
  }

  const play = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(frame)
    void video.play().catch(() => {
      // 自動再生が拒まれても、最初の1コマが貼られたまま形は見える
    })
  }
  const pause = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
    video.pause()
  }

  // 画面の外・裏のタブでは描かない。スマホの電池と発熱のため
  let inView = true
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      if (inView && !document.hidden) play()
      else pause()
    },
    { threshold: 0 },
  )
  io.observe(canvas)
  const onVisibility = () => (document.hidden || !inView ? pause() : play())
  document.addEventListener("visibilitychange", onVisibility)
  play()

  return {
    dispose: () => {
      pause()
      io.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointermove", onPointer)
      for (const item of disposables) item.dispose()
      renderer.dispose()
    },
  }
}
