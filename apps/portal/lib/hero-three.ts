// ヒーローの 3D 版。2D の座標系（axis-figure.tsx）を奥行きのある形に起こし、
// 短冊（積分の面積）の前の面に、本人の作品の映像を映す。ヒーローの 3 行の文字も
// 同じ鋼で 3D に起こす。
//
// three はこのファイルだけが読む。hero-scene.tsx が動的 import するので、
// 3D を使わない環境（WebGL が無い）では落ちてこない。
//
// 形の数値は持たない。短冊・曲線・軸・ラベルは、サーバーが描いた 2D の SVG から読む。
// 文字の位置も、HTML の文字が組まれた位置を1字ずつ測って置く。HTML の文字は消さず
// 透明にして残すので、読み上げ・選択・折り返しは今までどおり HTML が受け持つ。
//
// 質感は磨いた鋼（本人 2026-11-23）。金属は映り込みで金属に見えるので、
// RoomEnvironment を環境マップにし、そのまわりをゆっくり回して光を流す。
// 文字は読めることが先なので、正面（字の面）は暗い鋼、縁と側面を明るい鋼にする。
//
// 描くのは1枚の canvas（ヒーロー全体）に2回。文字の層はヒーロー全体、
// 図の層は .hero__stage の矩形だけに viewport を絞る。WebGL の文脈を1つに保つため。
import * as THREE from "three"
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"

import { createBackdrop, defaultEnvironment, readBackdrop } from "./hero-backdrop"

export type HeroSceneOptions = {
  canvas: HTMLCanvasElement
  hero: HTMLElement
  stage: HTMLElement
  svg: SVGSVGElement
  video: HTMLVideoElement
  /** three の typeface JSON（scripts/build-hero-font.py が書き出す） */
  fontData: unknown
  /** 3D にできた行。呼んだ側が HTML の文字を透明にする */
  textElements: HTMLElement[]
  /** 最初の1枚を描いたときに1回だけ呼ぶ */
  onReady: (builtText: HTMLElement[]) => void
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
const TEXT_FOV = 30
/** 字形はこの大きさで1回だけ作り、置くときに字の大きさへ縮める */
const GLYPH_UNIT = 100

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

/* ------------------------------------------------------------------ 字を測る
   HTML の文字を1字ずつ Range で測り、左端と基線の位置を返す。基線は「字の箱の上端から
   基線までの差」で出す。差は、同じ書体・大きさ・太さの字を画面外の見本に組み、高さ 0 の
   inline-block の下端で測る（フォントの値から推さない。ロゴ行は flex なので、行の中に
   印を差すと並びが変わって測れない）。 */
function baselineOffset(el: Element) {
  const style = getComputedStyle(el)
  const probe = document.createElement("div")
  probe.style.cssText =
    "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;line-height:normal"
  probe.style.fontFamily = style.fontFamily
  probe.style.fontSize = style.fontSize
  probe.style.fontWeight = style.fontWeight
  const text = document.createElement("span")
  text.textContent = "あ"
  const marker = document.createElement("span")
  marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline"
  probe.append(text, marker)
  document.body.append(probe)
  const offset = marker.getBoundingClientRect().bottom - text.getBoundingClientRect().top
  probe.remove()
  return offset
}

type Spot = { ch: string; x: number; baseline: number; size: number; accent: boolean }

function measureText(el: HTMLElement): Spot[] {
  const size = parseFloat(getComputedStyle(el).fontSize) || 16
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest("[aria-hidden='true']")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  })
  const spots: Spot[] = []
  const range = document.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? ""
    const offset = node.parentElement ? baselineOffset(node.parentElement) : size * 0.88
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (!ch.trim()) continue
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const rect = range.getClientRects()[0]
      if (!rect) continue
      const accent = Boolean(node.parentElement?.closest(".brand__number"))
      spots.push({ ch, x: rect.left, baseline: rect.top + offset, size, accent })
    }
  }
  range.detach()
  return spots
}

export function startHeroScene({
  canvas,
  hero,
  stage,
  svg,
  video,
  fontData,
  textElements,
  onReady,
}: HeroSceneOptions): HeroSceneHandle {
  const narrow = window.innerWidth < 768
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  })
  // 字の縁が読めることを優先し、スマホでもアンチエイリアスを入れて画素比は 1.5 まで
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.autoClear = false

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item)
    return item
  }

  /* ---- 環境（映り込み）と光。2つの層で同じものを使う ---- */
  // 背景の候補（?bg=1〜4）。無ければ今までどおり白の地に RoomEnvironment
  const backdropKind = readBackdrop()
  const backdrop = backdropKind ? keep(createBackdrop(backdropKind, renderer, narrow)) : null
  const envMap = backdrop ? backdrop.environment : keep(defaultEnvironment(renderer))
  // ボタン（2D のまま）の色を暗い地に合わせるための目印。globals.css が読む
  if (backdrop) document.documentElement.dataset.heroBg = backdrop.dark ? "dark" : "light"

  const textScene = new THREE.Scene()
  const chartScene = new THREE.Scene()
  for (const scene of [textScene, chartScene]) {
    scene.environment = envMap
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(-0.6, 1, 0.8)
    scene.add(key)
  }

  /* ---- 色のついた鋼 ----
     質感は磨いた鋼のまま（金属度 1・映り込み）、色はサイトの配色のオレンジと黒に戻す
     （本人 2026-11-23）。色は CSS の変数から読み、数値を二か所に持たない。
       黒の鋼: 軸・枕木・ラベル・字の面
       オレンジの鋼: レール・点・字の縁と側面・ロゴの数字
       短冊: 左（古い）の黒から右（新しい）のオレンジへ、1本ずつ濃さを変える */
  const css = getComputedStyle(document.documentElement)
  const cssColor = (name: string, fallback: string) =>
    new THREE.Color(css.getPropertyValue(name).trim() || fallback)
  const ink = cssColor("--grey-1100", "#18191d")
  const orange = cssColor("--red-500", "#ea4b17")
  const deepOrange = cssColor("--red-600", "#c63307")
  // 金属は色が映り込みの色になるので、真っ黒にすると何も映らない。黒は少し持ち上げる
  // 暗い地の候補では、黒の鋼が地に沈むので、鉄色（ガンメタル）まで持ち上げる
  const blackMetal = ink.clone().lerp(new THREE.Color("#ffffff"), backdrop?.dark ? 0.3 : 0.12)
  const metal = (color: THREE.Color, roughness: number) =>
    keep(new THREE.MeshStandardMaterial({ color, metalness: 1, roughness }))
  const blackSteel = metal(blackMetal, 0.16)
  const orangeSteel = metal(orange, 0.12)
  const deepOrangeSteel = metal(deepOrange, 0.14)
  // 字の面。白い地の上で字として読めるよう、黒の鋼を少し粗くして映り込みを和らげる
  // 暗い地の候補では、黒の字が読めないので面を明るい鋼にする
  // 暗い部屋を映す金属は暗く見えるので、わずかに自ら光らせて字として読ませる
  const faceSteel = backdrop?.dark
    ? keep(
        new THREE.MeshStandardMaterial({
          color: "#d5d9e0",
          metalness: 1,
          roughness: 0.2,
          emissive: "#9aa0aa",
          emissiveIntensity: 1,
        }),
      )
    : metal(blackMetal, 0.24)
  const accentFace = metal(deepOrange, 0.2)
  if (backdrop?.dark) {
    accentFace.emissive = orange.clone()
    accentFace.emissiveIntensity = 0.6
  }

  /* ---- 映像 ---- */
  const videoTexture = keep(new THREE.VideoTexture(video))
  videoTexture.colorSpace = THREE.SRGBColorSpace
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.generateMipmaps = false
  const videoMaterial = keep(new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false }))

  /* ================================================================ 図の層 */
  const chartCamera = new THREE.PerspectiveCamera(FOV, VB_W / VB_H, 10, 6000)
  const baseDistance = VB_H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))

  /* ---- 短冊 ---- */
  const rects = [...svg.querySelectorAll<SVGRectElement>(".bar")]
  const columns = rects.length
  const maxHeight = Math.max(...rects.map((r) => r.height.baseVal.value))
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

    // 黒 → 濃いオレンジ → オレンジ。前半で黒から濃いオレンジ、後半で明るいオレンジへ
    const k = rects.length > 1 ? index / (rects.length - 1) : 1
    const tone =
      k < 0.5
        ? blackMetal.clone().lerp(deepOrange, k / 0.5)
        : deepOrange.clone().lerp(orange, (k - 0.5) / 0.5)
    const side = metal(tone, 0.12)
    const mesh = new THREE.Mesh(geometry, [side, side, side, side, videoMaterial, side])
    mesh.position.set(toX(x + w / 2), toY(y + h), 0)
    mesh.scale.y = 0.0001
    chartScene.add(mesh)
    return { mesh, centerX: x + w / 2 }
  })

  /* ---- 曲線（鋼の線路）と点 ----
     曲線は短冊の奥行きいっぱいに敷いた線路にする（本人 2026-11-23「線路のような立体に」）。
     2本のレールは短冊の手前と奥の縁の上、枕木はその間に一定の間隔で渡す。
     点は2本のレールの間を走る */
  const curvePath = svg.querySelector<SVGPathElement>(".axis__curve")
  const curve2d = curvePath ? pathPoints(curvePath.getAttribute("d") ?? "") : []
  const RAIL_LIFT = 5
  const RAIL_RADIUS = 2.6
  const RAIL_Z = [-4, -DEPTH + 4]
  const curve3d = curve2d.map((p) => new THREE.Vector3(toX(p.x), toY(p.y) + RAIL_LIFT, -DEPTH / 2))
  const RADIAL = 10
  const tubeSegments = Math.max(1, curve3d.length - 1) * 2
  const rails = RAIL_Z.map((z) => {
    const path = new THREE.CurvePath<THREE.Vector3>()
    for (let i = 1; i < curve3d.length; i++) {
      path.add(
        new THREE.LineCurve3(
          curve3d[i - 1].clone().setZ(z),
          curve3d[i].clone().setZ(z),
        ),
      )
    }
    const geometry = keep(new THREE.TubeGeometry(path, tubeSegments, RAIL_RADIUS, RADIAL, false))
    geometry.setDrawRange(0, 0)
    chartScene.add(new THREE.Mesh(geometry, orangeSteel))
    return geometry
  })
  const curveIndexCount = rails[0]?.index?.count ?? 0

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
  const dot = new THREE.Mesh(keep(new THREE.SphereGeometry(9, 32, 20)), orangeSteel)
  chartScene.add(dot)

  // 枕木。弧長で等間隔に置き、曲線が引かれたところまでだけ見せる
  const SLEEPER_GAP = 24
  const sleeperGeometry = keep(new THREE.BoxGeometry(6, 2.6, DEPTH + 6))
  const sleepers: { mesh: THREE.Mesh; at: number }[] = []
  const tangent = new THREE.Vector3()
  for (let at = SLEEPER_GAP / 2; at < total; at += SLEEPER_GAP) {
    let i = 1
    while (i < lengths.length - 1 && lengths[i] < at) i++
    tangent.subVectors(curve3d[i], curve3d[i - 1]).normalize()
    const mesh = new THREE.Mesh(sleeperGeometry, blackSteel)
    pointAt(at, mesh.position)
    mesh.position.y -= RAIL_RADIUS + 0.6
    mesh.rotation.z = Math.atan2(tangent.y, tangent.x)
    mesh.visible = false
    chartScene.add(mesh)
    sleepers.push({ mesh, at })
  }

  /* ---- 軸（鋼のパイプ）と矢じり ----
     2D の細い線のままだと 3D の中で消えるので、太いパイプと大きめの円錐にする。
     端は球で丸める */
  const AXIS_RADIUS = 5
  for (const path of svg.querySelectorAll<SVGPathElement>(".axis__lines path")) {
    const [a, b] = pathPoints(path.getAttribute("d") ?? "")
    if (!a || !b) continue
    const from = new THREE.Vector3(toX(a.x), toY(a.y), 0)
    const to = new THREE.Vector3(toX(b.x), toY(b.y), 0)
    const length = from.distanceTo(to)
    const rod = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(AXIS_RADIUS, AXIS_RADIUS, length, 24)),
      blackSteel,
    )
    rod.position.copy(from).add(to).multiplyScalar(0.5)
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize())
    chartScene.add(rod)
    const cap = new THREE.Mesh(keep(new THREE.SphereGeometry(AXIS_RADIUS, 20, 12)), blackSteel)
    cap.position.copy(from)
    chartScene.add(cap)
  }
  for (const path of svg.querySelectorAll<SVGPathElement>(".axis__heads path")) {
    const pts = pathPoints(path.getAttribute("d") ?? "")
    if (pts.length < 3) continue
    // 三角形の頂点（先端）と底辺の中点から、円錐の向きと長さを決める
    const [tip, p1, p2] = pts
    const base = new THREE.Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
    const tip3 = new THREE.Vector3(toX(tip.x), toY(tip.y), 0)
    const base3 = new THREE.Vector3(toX(base.x), toY(base.y), 0)
    // 底は SVG の位置に残し、パイプの太さに合わせて先へ伸ばす
    const dir = tip3.clone().sub(base3).normalize()
    const height = Math.max(tip3.distanceTo(base3) * 1.6, AXIS_RADIUS * 6)
    const radius = Math.max((p1.distanceTo(p2) / 2) * 1.6, AXIS_RADIUS * 2.4)
    const cone = new THREE.Mesh(keep(new THREE.ConeGeometry(radius, height, 32)), blackSteel)
    cone.position.copy(base3).addScaledVector(dir, height / 2)
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    chartScene.add(cone)
  }

  /* ================================================================ 字 */
  const font: Font = new FontLoader().parse(fontData as never)
  const glyphCache = new Map<string, THREE.BufferGeometry | null>()
  const glyphGeometry = (ch: string) => {
    if (glyphCache.has(ch)) return glyphCache.get(ch) ?? null
    if (!(font.data.glyphs as Record<string, unknown>)[ch]) {
      glyphCache.set(ch, null)
      return null
    }
    const depth = GLYPH_UNIT * 0.14
    const geometry = keep(
      new TextGeometry(ch, {
        font,
        size: GLYPH_UNIT,
        depth,
        curveSegments: narrow ? 3 : 5,
        bevelEnabled: true,
        bevelThickness: GLYPH_UNIT * 0.05,
        bevelSize: GLYPH_UNIT * 0.028,
        bevelSegments: 2,
      }),
    )
    // 字の面を z = 0 に揃える（押し出しは奥へ）
    geometry.translate(0, 0, -depth - GLYPH_UNIT * 0.05)
    glyphCache.set(ch, geometry)
    return geometry
  }

  /* 軸のラベル（O・x・y）。図の層に置く */
  for (const text of svg.querySelectorAll<SVGTextElement>(".axis__labels text")) {
    const geometry = glyphGeometry(text.textContent ?? "")
    if (!geometry) continue
    const mesh = new THREE.Mesh(geometry, [faceSteel, blackSteel])
    const s = 20 / GLYPH_UNIT
    mesh.scale.set(s, s, s)
    mesh.position.set(toX(Number(text.getAttribute("x"))), toY(Number(text.getAttribute("y"))), 0)
    chartScene.add(mesh)
  }

  /* ヒーローの 3 行。行のどこかに作れない字があれば、その行は HTML のまま残す */
  const textCamera = new THREE.PerspectiveCamera(TEXT_FOV, 1, 1, 10000)
  const textGroup = new THREE.Group()
  textScene.add(textGroup)
  const builtText = textElements.filter((el) =>
    [...(el.textContent ?? "")].every((ch) => !ch.trim() || glyphCache.has(ch) || glyphGeometry(ch)),
  )
  // 字の現れる順（ロゴ行 → 見出し → 小見出し）。1字ずつ基線から立ち上がる
  type Placed = { mesh: THREE.Object3D; delay: number }
  let placed: Placed[] = []

  /* ロゴの図（BrandMark）。2本の階段状の線を鋼の管にする。形は brand-mark.tsx の path から読む */
  const markSvg = hero.querySelector<SVGSVGElement>(".hero__glyph svg")
  const markPaths = markSvg
    ? [...markSvg.querySelectorAll("path")].map((p) => pathPoints(p.getAttribute("d") ?? ""))
    : []
  const markGroup = new THREE.Group()
  if (markPaths.length && builtText.some((el) => el.classList.contains("hero__mark"))) {
    for (const pts of markPaths) {
      const path = new THREE.CurvePath<THREE.Vector3>()
      const v = pts.map((p) => new THREE.Vector3(p.x - 50, 50 - p.y, 0))
      for (let i = 1; i < v.length; i++) path.add(new THREE.LineCurve3(v[i - 1], v[i]))
      markGroup.add(new THREE.Mesh(keep(new THREE.TubeGeometry(path, 32, 5.5, 10, false)), faceSteel))
      // 角と端を丸める（2D の round の継ぎと端）
      for (const corner of v) {
        const ball = new THREE.Mesh(keep(new THREE.SphereGeometry(5.5, 12, 8)), faceSteel)
        ball.position.copy(corner)
        markGroup.add(ball)
      }
    }
    textGroup.add(markGroup)
  }

  let heroWidth = 1
  let heroHeight = 1
  const layoutText = () => {
    const heroRect = hero.getBoundingClientRect()
    heroWidth = heroRect.width || 1
    heroHeight = heroRect.height || 1
    textCamera.aspect = heroWidth / heroHeight
    textCamera.position.set(0, 0, heroHeight / 2 / Math.tan(THREE.MathUtils.degToRad(TEXT_FOV / 2)))
    textCamera.updateProjectionMatrix()
    textCamera.lookAt(0, 0, 0)

    for (const item of placed) if (item.mesh !== markGroup) textGroup.remove(item.mesh)
    placed = []
    const toWorldX = (px: number) => px - heroRect.left - heroWidth / 2
    const toWorldY = (py: number) => heroHeight / 2 - (py - heroRect.top)

    let order = 0
    for (const el of builtText) {
      if (el.classList.contains("hero__mark") && markSvg && markGroup.children.length) {
        const r = markSvg.getBoundingClientRect()
        const s = r.width / 100
        markGroup.scale.set(s, s, s)
        markGroup.position.set(toWorldX(r.left + r.width / 2), toWorldY(r.top + r.height / 2), 0)
        placed.push({ mesh: markGroup, delay: order++ })
      }
      for (const spot of measureText(el)) {
        const geometry = glyphGeometry(spot.ch)
        if (!geometry) continue
        const mesh = new THREE.Mesh(
          geometry,
          spot.accent ? [accentFace, orangeSteel] : [faceSteel, deepOrangeSteel],
        )
        const s = spot.size / GLYPH_UNIT
        mesh.scale.set(s, s, s)
        mesh.position.set(toWorldX(spot.x), toWorldY(spot.baseline), 0)
        textGroup.add(mesh)
        placed.push({ mesh, delay: order++ })
      }
    }
  }

  /* ---- 寸法 ---- */
  let stageBox = { x: 0, y: 0, w: 1, h: 1 }
  const resize = () => {
    const width = hero.clientWidth
    const height = hero.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    const heroRect = hero.getBoundingClientRect()
    const stageRect = stage.getBoundingClientRect()
    // GL の viewport は下からの座標
    stageBox = {
      x: stageRect.left - heroRect.left,
      y: heroRect.bottom - stageRect.bottom,
      w: stageRect.width,
      h: stageRect.height,
    }
    chartCamera.aspect = stageBox.w / (stageBox.h || 1)
    chartCamera.updateProjectionMatrix()
    layoutText()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(hero)
  resize()
  // Web フォントが後から差し替わると字の位置が変わるので、揃ってから測り直す
  void document.fonts?.ready.then(() => resize())

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
       0.0〜1.6 s  曲線を引く・点が走る。字が1字ずつ基線から立つ
       0.45 s〜    短冊が左から立つ
       2.0〜3.6 s  図が正面から斜めへ回る
       以降        ゆっくり揺れる。映り込みが流れて鋼が光る                   */
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

    // 字
    for (const { mesh, delay } of placed) {
      const k = easeOut(clamp01((t - 0.1 - delay * 0.03) / 0.45))
      const s = mesh.scale.x
      mesh.scale.y = Math.max(0.0001, s * k)
    }

    // 図
    const drawn = easeInOut(clamp01(t / 1.6))
    const segments = Math.ceil(drawn * tubeSegments)
    for (const rail of rails) rail.setDrawRange(0, Math.min(curveIndexCount, segments * RADIAL * 6))
    for (const sleeper of sleepers) sleeper.mesh.visible = sleeper.at <= total * drawn
    dot.position.copy(pointAt(stopLength * drawn, dotPosition))
    dot.position.y += 6
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
    chartCamera.position.set(
      target.x + distance * Math.sin(yaw) * Math.cos(pitch),
      target.y + distance * Math.sin(pitch),
      target.z + distance * Math.cos(yaw) * Math.cos(pitch),
    )
    chartCamera.lookAt(target)

    // 字の層を少しだけ傾ける。面が全部同じ向きだと映り込みが一様になり、鋼に見えない。
    // 傾きは読める範囲に留める（数度）
    textGroup.rotation.set(
      pointer.y * 0.03 + Math.sin(t * 0.21) * 0.02,
      Math.sin(t * 0.35) * 0.06 + pointer.x * 0.05,
      0,
    )

    // 映り込みを回して、鋼の上を光が流れるようにする
    const sweep = Math.sin(t * 0.35) * 0.6 + pointer.x * 0.25
    textScene.environmentRotation.set(pointer.y * 0.15, sweep, 0)
    chartScene.environmentRotation.set(0, sweep * 0.8, 0)

    renderer.setViewport(0, 0, heroWidth, heroHeight)
    renderer.clear()
    if (backdrop) {
      backdrop.render(renderer, t, heroWidth, heroHeight)
      renderer.clearDepth()
    }
    renderer.render(textScene, textCamera)
    renderer.clearDepth()
    renderer.setViewport(stageBox.x, stageBox.y, stageBox.w, stageBox.h)
    renderer.render(chartScene, chartCamera)

    if (!readySent) {
      readySent = true
      onReady(builtText)
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
