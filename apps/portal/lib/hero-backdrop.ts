// ヒーローの背景の候補（本人 2026-11-23「背景のイメージがまだ無いので、見比べて選べる候補を 4 つ」）。
// 本番は差し替えない。?bg=1〜4 のときだけ hero-three.ts がこれを読む。選ばれたら、
// 選ばれた1つだけを残して、ほかは消す。
//
// 鋼は映り込みで金属に見えるので、各案は「背景」と「鋼に映る環境」を対で持つ。
// 白の上で鋼が灰色に見えるのは、白い部屋を映して明暗の差が無いから。
// 暗い部屋に明るい光の板を置くと、縁に強い光が乗って磨いた鋼に見える。
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

export type BackdropKind = 1 | 2 | 3 | 4

export const BACKDROP_LABEL: Record<BackdropKind, string> = {
  1: "白・研究所の光",
  2: "設計図・数学の図面",
  3: "光の粒が漂う奥行き",
  4: "鋼の火花と熱",
}

export function readBackdrop(): BackdropKind | null {
  const value = Number(new URLSearchParams(window.location.search).get("bg"))
  return value >= 1 && value <= 4 ? (value as BackdropKind) : null
}

export type Backdrop = {
  kind: BackdropKind
  /** 暗い背景か。暗いときは字の面を明るい鋼にする（黒の字は暗い地で読めない） */
  dark: boolean
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

const FRAGMENT: Record<BackdropKind, string> = {
  // 白・研究所の光: 白を土台に、上から冷たい光が差し、細い光の帯がゆっくり横切る。床に向かって少し落とす
  1: /* glsl */ `
    uniform float uTime; uniform vec2 uResolution; varying vec2 vUv;
    void main() {
      vec2 p = vUv;
      vec3 top = vec3(0.925, 0.945, 0.965);
      vec3 bottom = vec3(0.985, 0.988, 0.992);
      vec3 col = mix(bottom, top, smoothstep(0.15, 1.0, p.y));
      // 天井の照明の帯（2 本）が映り込んだような、ごく淡い横の光
      float band = 0.0;
      for (int i = 0; i < 2; i++) {
        float y = 0.78 - float(i) * 0.16;
        float x = fract(p.x * 0.5 + uTime * 0.02 + float(i) * 0.37);
        band += smoothstep(0.012, 0.0, abs(p.y - y)) * smoothstep(0.0, 0.2, x) * smoothstep(1.0, 0.6, x);
      }
      col += vec3(0.02, 0.025, 0.03) * band;
      // 端を少しだけ落として、図に目を寄せる
      float v = smoothstep(1.25, 0.35, length((p - vec2(0.5, 0.45)) * vec2(1.2, 1.0)));
      col *= mix(0.94, 1.0, v);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  // 設計図・数学の図面: 黒の地に方眼（細と太）、ゆっくり描かれていく円と寸法線
  2: /* glsl */ `
    uniform float uTime; uniform vec2 uResolution; varying vec2 vUv;
    float grid(vec2 px, float step, float width) {
      vec2 g = abs(fract(px / step - 0.5) - 0.5) * step;
      return 1.0 - smoothstep(0.0, width, min(g.x, g.y));
    }
    void main() {
      vec2 px = vUv * uResolution + vec2(uTime * 6.0, uTime * 2.0);
      vec3 col = vec3(0.07, 0.075, 0.09);
      col += vec3(0.05, 0.06, 0.075) * grid(px, 24.0, 0.8);
      col += vec3(0.09, 0.1, 0.12) * grid(px, 120.0, 1.0);
      // 円と弧（数学の図）。半径が時間でゆっくり描かれる
      vec2 q = vUv * uResolution;
      vec2 c1 = vec2(uResolution.x * 0.78, uResolution.y * 0.72);
      float r1 = length(q - c1);
      float arc = smoothstep(1.2, 0.0, abs(r1 - 180.0)) + smoothstep(1.2, 0.0, abs(r1 - 260.0)) * 0.6;
      float ang = atan(q.y - c1.y, q.x - c1.x) / 6.2831 + 0.5;
      arc *= step(ang, fract(uTime * 0.05) * 0.8 + 0.2);
      col += vec3(0.9, 0.35, 0.12) * arc * 0.35;
      vec2 c2 = vec2(uResolution.x * 0.16, uResolution.y * 0.8);
      float r2 = length(q - c2);
      col += vec3(0.25, 0.28, 0.32) * smoothstep(1.0, 0.0, abs(r2 - 120.0));
      // 寸法線（横）
      float dim = smoothstep(1.0, 0.0, abs(q.y - uResolution.y * 0.9)) * step(uResolution.x * 0.55, q.x) * step(q.x, uResolution.x * 0.95);
      col += vec3(0.25, 0.28, 0.32) * dim;
      float v = smoothstep(1.3, 0.3, length(vUv - 0.5) * 1.4);
      col *= mix(0.6, 1.0, v);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  // 光の粒が漂う奥行き: 中央がわずかに明るい暗がり。粒は別の Points で描く
  3: /* glsl */ `
    uniform float uTime; uniform vec2 uResolution; varying vec2 vUv;
    void main() {
      vec2 p = vUv - vec2(0.5, 0.42);
      p.x *= uResolution.x / uResolution.y;
      float glow = exp(-dot(p, p) * 2.2);
      vec3 col = mix(vec3(0.035, 0.037, 0.045), vec3(0.11, 0.115, 0.13), glow);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  // 鋼の火花と熱: 黒の地の下から熱のオレンジがにじみ、揺らぐ。火花は別の Points で描く
  4: /* glsl */ `
    uniform float uTime; uniform vec2 uResolution; varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    void main() {
      vec2 p = vUv;
      float n = noise(vec2(p.x * 6.0, p.y * 4.0 - uTime * 0.6)) * 0.5 + noise(vec2(p.x * 13.0, p.y * 9.0 - uTime * 1.1)) * 0.25;
      float heat = smoothstep(0.75, 0.0, p.y + (n - 0.35) * 0.18);
      float center = exp(-pow((p.x - 0.62) * 2.2, 2.0));
      vec3 col = vec3(0.03, 0.028, 0.03);
      col += vec3(0.75, 0.2, 0.04) * heat * heat * (0.35 + 0.65 * center);
      col += vec3(0.35, 0.08, 0.02) * heat * 0.25;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

/* ---------------------------------------------------------------- 粒（3・4） */
const POINT_VERTEX = /* glsl */ `
  uniform float uTime; uniform float uPixel; uniform float uMode;
  attribute vec4 seed;
  varying float vAlpha; varying float vHot;
  void main() {
    vec3 p = position;
    float life = 1.0;
    if (uMode < 0.5) {
      // 漂う粒: ゆっくり上へ流れ、横に揺れる。範囲の外に出たら下から戻る
      p.y = mod(p.y + uTime * (6.0 + seed.x * 10.0) + 300.0, 600.0) - 300.0;
      p.x += sin(uTime * 0.3 + seed.y * 6.28) * 14.0;
      vAlpha = 0.25 + 0.6 * seed.z;
      vHot = seed.w;
    } else {
      // 火花: 下の熱から斜め上へ飛び、重さで落ちながら消える。seed.x が寿命の位相
      float t = fract(uTime * (0.45 + seed.x * 0.35) + seed.y);
      vec2 v = vec2((seed.z - 0.5) * 260.0, 260.0 + seed.w * 260.0);
      p = vec3(position.x + v.x * t, -300.0 + v.y * t - 260.0 * t * t, position.z);
      life = 1.0 - t;
      vAlpha = life;
      vHot = 1.0;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uMode < 0.5 ? (2.0 + seed.z * 5.0) : (2.0 + 3.0 * life);
    gl_PointSize = size * uPixel * (900.0 / -mv.z);
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

export function createBackdrop(
  kind: BackdropKind,
  renderer: THREE.WebGLRenderer,
  narrow: boolean,
): Backdrop {
  const disposables: { dispose: () => void }[] = []

  /* 映り込み。1 は白い地のまま、鋼に黒い部屋と明るい板を映して明暗を付ける */
  let environment: THREE.Texture
  if (kind === 1) {
    environment = studio(renderer, "#1a1c20", [
      { position: [0, 8, 2], size: [14, 3], color: "#ffffff", power: 6 },
      { position: [-8, 2, 4], size: [3, 10], color: "#eef4ff", power: 4 },
      { position: [8, 1, 3], size: [2, 8], color: "#ffffff", power: 3 },
      { position: [0, -2, 9], size: [10, 2], color: "#ffffff", power: 2 },
    ])
  } else if (kind === 2) {
    environment = studio(renderer, "#0c0e12", [
      { position: [0, 8, 3], size: [12, 1.6], color: "#e8f0ff", power: 7 },
      { position: [-9, 0, 2], size: [1.4, 12], color: "#ffffff", power: 5 },
      { position: [9, 0, 2], size: [1.4, 12], color: "#ffffff", power: 3 },
    ])
  } else if (kind === 3) {
    environment = studio(renderer, "#08090b", [
      { position: [-6, 6, 5], size: [5, 5], color: "#ffffff", power: 5 },
      { position: [7, 3, 4], size: [2, 6], color: "#cfe0ff", power: 4 },
      { position: [0, -6, 6], size: [8, 1.5], color: "#ffffff", power: 1.5 },
    ])
  } else {
    environment = studio(renderer, "#0a0706", [
      { position: [0, -8, 4], size: [16, 4], color: "#ff6a1a", power: 6 },
      { position: [-7, 6, 4], size: [4, 4], color: "#ffffff", power: 4 },
      { position: [8, 0, 3], size: [1.5, 9], color: "#ffb070", power: 3 },
    ])
  }
  disposables.push(environment)

  /* 地 */
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  }
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT[kind],
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
    uMode: { value: kind === 4 ? 1 : 0 },
  }
  if (kind === 3 || kind === 4) {
    const count = kind === 3 ? (narrow ? 160 : 360) : narrow ? 120 : 260
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * (kind === 3 ? 1600 : 700) + (kind === 4 ? 180 : 0)
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600
      positions[i * 3 + 2] = (Math.random() - 0.5) * (kind === 3 ? 900 : 300)
      for (let k = 0; k < 4; k++) seeds[i * 4 + k] = Math.random()
      // 漂う粒は 1 割だけ温かい色にする（オレンジの短冊と響かせる）
      if (kind === 3) seeds[i * 4 + 3] = Math.random() < 0.12 ? 1 : 0
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
    kind,
    dark: kind !== 1,
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

// 既定（候補を選ぶ前）の映り込み。本番はこれのまま
export function defaultEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const texture = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  return texture
}
