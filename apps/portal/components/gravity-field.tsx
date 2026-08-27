"use client"

import { useEffect, useRef } from "react"

/* 08 — 暗転の帯の背景。波紋の伝わる重力場。
 *
 * 仕様:
 *   - 中心から同心円の波が外へ伝わり、遠くで消える。しばらくすると次の波が出る
 *   - 面は斜め上から見下ろす。奥ほど点が小さく暗くなる
 *   - 点はばらばらのまま。線でつながない
 *
 * Three.js は使わない。透視投影は式が短く、この1つの演出のために
 * 依存を足す理由がないため。
 *
 * 守ること:
 *   - JS が無い・動きを開始できないときは1フレームだけ描いて止める（消しはしない。地の一部なので）
 *   - requestAnimationFrame が回らなくても、最初の1枚は必ず出る
 *   - 画面外では回さない
 *   - 文字の下に敷くだけ。当たり判定を持たない
 *
 * 定数も式も 08 のまま。数値を動かすと見え方が別物になる。
 */
export function GravityField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const motionOK = document.documentElement.classList.contains("js-anim")

    /* --- 視点 ---------------------------------------------------------
       水平線が帯の上から 18%、面の手前側が帯の中ほどに来るように、
       先に数値を解いてから決めた組み合わせ。 */
    const TILT = 0.45 // 見下ろす角度（ラジアン）
    const CAM_Y = 6 // 面から見た視点の高さ
    const HORIZON = 0.14 // 水平線の位置（帯の高さに対する比）
    /* 焦点距離は固定にしない。固定にすると面の見える範囲が px で決まってしまい、
       帯が高い画面では下半分が空くだけになる（実際に空いた）。帯の高さに比例させる。 */
    const FOCAL_RATIO = 0.92
    let FOCAL = 420

    const sinT = Math.sin(TILT)
    const cosT = Math.cos(TILT)

    /* --- 点の置き方 ----------------------------------------------------
       世界座標で等間隔に置くと、透視のせいで手前がすかすかになる（実際になった）。
       点は線でつながないので格子が規則的である必要はない。
       **画面の上で等間隔になるように**置く。
         - 奥行きは 1/z を等分する（画面 y はおおむね 1/z に比例するため）
         - 横は行ごとに間隔を変える（奥の行ほど世界座標では詰める）
       波紋は世界座標の距離 r で決まるので、置き方を変えても円のままになる。 */
    const SCREEN_STEP = 15 // 画面上の目標間隔(px)
    const Z_NEAR = 5
    const Z_FAR = 74
    const NZ = 46
    const X_HALF = 62
    const CENTER_Z = 26 // 波紋の中心

    let pts: { x: number; z: number; r: number }[] = []

    const buildPoints = () => {
      pts = []
      for (let iz = 0; iz < NZ; iz++) {
        const u = iz / (NZ - 1)
        const z = 1 / (1 / Z_NEAR + (1 / Z_FAR - 1 / Z_NEAR) * u)
        const zc = CAM_Y * sinT + z * cosT // 波のない状態での奥行き
        const step = Math.max(0.35, (SCREEN_STEP * zc) / FOCAL)
        const n = Math.min(180, Math.ceil((X_HALF * 2) / step))
        for (let ix = 0; ix <= n; ix++) {
          const x = -X_HALF + (ix / n) * X_HALF * 2
          pts.push({ x, z, r: Math.hypot(x, z - CENTER_Z) })
        }
      }
    }

    /* --- 波紋 ----------------------------------------------------------
       RINGS 本を PERIOD ずつずらして走らせる。
       どれも中心から外へ出て、進むほど弱り、一周したら次が生まれる。 */
    const SPEED = 8.5
    const WIDTH = 4.2 // 波の束の厚み
    const PERIOD = 3.4 // 次の波が出るまで
    const RINGS = 3
    const CYCLE = PERIOD * RINGS
    const DECAY = 34 // 遠くでの減衰
    const AMP = 2.2
    const K = 0.55 // 波数

    const height = (r: number, t: number) => {
      let h = 0
      for (let k = 0; k < RINGS; k++) {
        const front = ((t + k * PERIOD) % CYCLE) * SPEED
        const d = r - front
        const env = Math.exp(-(d * d) / (2 * WIDTH * WIDTH))
        if (env < 0.004) continue
        h += Math.sin(d * K) * env * Math.exp(-front / DECAY)
      }
      return h * AMP
    }

    let W = 0
    let H = 0
    let cx = 0
    let cy = 0
    let last = 0

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return false
      const dpr = Math.min(devicePixelRatio || 1, 2)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = W / 2
      FOCAL = H * FOCAL_RATIO
      cy = HORIZON * H + FOCAL * (sinT / cosT) // 水平線を狙った位置へ置く
      buildPoints() // 間隔は FOCAL に依存するので、ここで組む
      return true
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      for (const p of pts) {
        const y = height(p.r, t) - CAM_Y
        const zc = -y * sinT + p.z * cosT
        if (zc <= 0.5) continue
        const yc = y * cosT + p.z * sinT
        const k = FOCAL / zc
        const sx = cx + p.x * k
        if (sx < -8 || sx > W + 8) continue
        const sy = cy - yc * k
        if (sy < -8 || sy > H + 8) continue

        // 奥ほど小さく暗い。波頭にいる点だけ持ち上げる
        const depth = Math.min(1, 18 / zc)
        const lift = Math.min(1, Math.abs(y + CAM_Y) / AMP)
        const size = (0.6 + depth * 1.6) * (1 + lift * 0.55)
        const alpha = (0.09 + depth * 0.26) * (0.5 + lift * 0.9)

        ctx.fillStyle =
          lift > 0.6
            ? `rgba(255,138,101,${(alpha * 0.9).toFixed(3)})`
            : `rgba(200,208,222,${alpha.toFixed(3)})`
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size)
      }
    }

    if (!resize()) return

    const onResize = () => {
      if (resize()) draw(last)
    }
    addEventListener("resize", onResize, { passive: true })

    draw(0) // rAF が回らなくても、最初の1枚は必ず出る
    if (!motionOK) {
      return () => removeEventListener("resize", onResize)
    }

    let live = false
    let raf = 0
    const t0 = performance.now()

    const loop = (now: number) => {
      if (!live) return
      last = (now - t0) / 1000
      draw(last)
      raf = requestAnimationFrame(loop)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        live = entry.isIntersecting
        if (live) raf = requestAnimationFrame(loop)
        else cancelAnimationFrame(raf)
      },
      { threshold: 0 },
    )
    observer.observe(canvas.parentElement as Element)

    return () => {
      removeEventListener("resize", onResize)
      observer.disconnect()
      live = false
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="close__stage" aria-hidden="true">
      <canvas id="gfield" ref={canvasRef} />
    </div>
  )
}
