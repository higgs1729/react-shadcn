// ヒーローの背景: 光の粒が漂う奥行き（本人 2026-11-23、4 つの候補から 3 を選んだ）。
// 暗がりの中央がわずかに明るく、粒がゆっくり上へ流れる。1 割の粒はオレンジ。
//
// 鋼は映り込みで金属に見えるので、背景は「地」と「鋼に映る環境」を対で持つ。
// 暗い部屋に明るい光の板を置くと、縁に強い光が乗って磨いた鋼に見える。
import * as THREE from "three"

export type Backdrop = {
  environment: THREE.Texture
  render: (renderer: THREE.WebGLRenderer, t: number, width: number, height: number) => void
  dispose: () => void
}

/* ---------------------------------------------------------------- 映り込み
   黒い部屋に光の板を置いた撮影用の部屋。板の位置・大きさ・色で鋼の見え方が決まる */
type Panel = { position: [number, number, number]; size: [number, number]; color: string; power: number }

function studio(renderer: THREE.WebGLRenderer, wall: string, panels: Panel[]) {
  const scene = new THREE.Scene()
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
    new THREE.MeshBasicMaterial({ color: wall, side: THREE.BackSide }),
  )
  scene.add(room)
  for (const panel of panels) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(panel.color).multiplyScalar(panel.power),
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...panel.size), material)
    mesh.position.set(...panel.position)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
  }
  const pmrem = new THREE.PMREMGenerator(renderer)
  const texture = pmrem.fromScene(scene, 0.02).texture
  pmrem.dispose()
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      ;(object.material as THREE.Material).dispose()
    }
  })
  return texture
}

/* ---------------------------------------------------------------- 地
   画面いっぱいの板に、断片シェーダで地を描く。uResolution は CSS px */
const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

// 地の明るさ。黒いヘッダーとの境目が見えるよう、上端をヘッダーより明るい灰青にし、
// 下へ濃紺に沈める（本人 2026-11-23「暗すぎて境目が分からない」→ 3 段から 1 段目に決めた）。
// 値は表示の sRGB のまま
const TONE = { top: "#262c39", bottom: "#0f1218", glow: "#323a4a" }

const FRAGMENT = /* glsl */ `
    uniform float uTime; uniform vec2 uResolution;
    uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uGlow;
    varying vec2 vUv;
    void main() {
      vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
      vec2 p = vUv - vec2(0.5, 0.42);
      p.x *= uResolution.x / uResolution.y;
      float glow = exp(-dot(p, p) * 2.2);
      col = mix(col, uGlow, glow * 0.55);
      gl_FragColor = vec4(col, 1.0);
    }
  `

/* ---------------------------------------------------------------- 粒 */
const POINT_VERTEX = /* glsl */ `
  uniform float uTime; uniform float uPixel;
  attribute vec4 seed;
  varying float vAlpha; varying float vHot;
  void main() {
    // 漂う粒: ゆっくり上へ流れ、横に揺れる。範囲の外に出たら下から戻る
    vec3 p = position;
    p.y = mod(p.y + uTime * (6.0 + seed.x * 10.0) + 300.0, 600.0) - 300.0;
    p.x += sin(uTime * 0.3 + seed.y * 6.28) * 14.0;
    vAlpha = 0.25 + 0.6 * seed.z;
    vHot = seed.w;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + seed.z * 5.0) * uPixel * (900.0 / -mv.z);
  }
`
const POINT_FRAGMENT = /* glsl */ `
  varying float vAlpha; varying float vHot;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    vec3 cool = vec3(0.85, 0.9, 1.0);
    vec3 hot = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.85, 0.5), smoothstep(0.25, 0.0, d));
    gl_FragColor = vec4(mix(cool, hot, vHot), a * vAlpha);
  }
`

export function createBackdrop(renderer: THREE.WebGLRenderer, narrow: boolean): Backdrop {
  const tone = TONE
  // 2D の地（CSS）とヒーローの下の境目を合わせるため、選ばれた段の色を html に書く
  document.documentElement.style.setProperty("--hero-deep", tone.bottom)
  const disposables: { dispose: () => void }[] = []

  /* 映り込み。黒い部屋に光の板。字が暗い地に沈まないよう、正面寄りにも板を置く */
  const environment = studio(renderer, "#08090b", [
    { position: [-6, 6, 5], size: [5, 5], color: "#ffffff", power: 5 },
    { position: [7, 3, 4], size: [2, 6], color: "#cfe0ff", power: 4 },
    { position: [0, 1, 9], size: [9, 2.5], color: "#ffffff", power: 3 },
    { position: [0, -6, 6], size: [8, 1.5], color: "#ffffff", power: 1.5 },
  ])
  disposables.push(environment)

  /* 地 */
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    // シェーダは色空間を変えずに書き出すので、表示の sRGB の値をそのまま渡す
    uTop: { value: new THREE.Color().setStyle(tone.top, THREE.LinearSRGBColorSpace) },
    uBottom: { value: new THREE.Color().setStyle(tone.bottom, THREE.LinearSRGBColorSpace) },
    uGlow: { value: new THREE.Color().setStyle(tone.glow, THREE.LinearSRGBColorSpace) },
  }
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      depthTest: false,
      depthWrite: false,
    }),
  )
  plane.frustumCulled = false
  const planeScene = new THREE.Scene()
  planeScene.add(plane)
  const planeCamera = new THREE.Camera()
  disposables.push(plane.geometry, plane.material as THREE.Material)

  /* 粒 */
  let points: THREE.Points | undefined
  const pointScene = new THREE.Scene()
  const pointCamera = new THREE.PerspectiveCamera(40, 1, 1, 4000)
  pointCamera.position.set(0, 0, 900)
  const pointUniforms = {
    uTime: { value: 0 },
    uPixel: { value: renderer.getPixelRatio() },
  }
  {
    const count = narrow ? 160 : 360
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1600
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600
      positions[i * 3 + 2] = (Math.random() - 0.5) * 900
      for (let k = 0; k < 4; k++) seeds[i * 4 + k] = Math.random()
      // 漂う粒は 1 割だけ温かい色にする（オレンジの短冊と響かせる）
      seeds[i * 4 + 3] = Math.random() < 0.12 ? 1 : 0
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 4))
    const material = new THREE.ShaderMaterial({
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      uniforms: pointUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    points = new THREE.Points(geometry, material)
    points.frustumCulled = false
    pointScene.add(points)
    disposables.push(geometry, material)
  }

  return {
    environment,
    render: (r, t, width, height) => {
      uniforms.uTime.value = t
      uniforms.uResolution.value.set(width, height)
      r.render(planeScene, planeCamera)
      if (points) {
        pointUniforms.uTime.value = t
        pointCamera.aspect = width / (height || 1)
        pointCamera.updateProjectionMatrix()
        r.render(pointScene, pointCamera)
      }
    },
    dispose: () => {
      for (const item of disposables) item.dispose()
    },
  }
}
