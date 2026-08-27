"use client"

import { useEffect, useRef } from "react"

/* 08 — ヒーローの演出層。座標系と積分領域。
 *
 * 07 は Antigravity と同じく WebGL の粒子をこの位置に置いていた。
 * 08 は同じ「演出を文書から隔離する」規律のまま、中身を portal 固有のモチーフに
 * 入れ替える。借り物の粒子ではなく、こちらの意味を持った層にするのが狙い。
 *
 * ヒーローで動かすものは3つだけ。
 *   1. 曲線が左から引かれる
 *   2. 短冊が左から順に立つ（積分が積み上がる）
 *   3. 点が曲線の上を走る
 * どれも「積み上がる」ことを言っている。制作物が増えることと同じ。
 *
 * 守ること:
 *   - JS が無い・読み込みに失敗したときは完成形を静止で見せる（消さない。図だから）
 *   - GSAP が無くても・読み込みに失敗しても完成形が出る
 *
 * 08 では main.js と axis.js が同じ .hero__stage に別々の視差を掛けていて、
 * 後から読まれる axis.js の 10% が実際の見た目だった。ここは1つに寄せている。
 */
export function AxisFigure() {
  const svgRef = useRef<SVGSVGElement>(null)
  const curveRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const curve = curveRef.current
    const dot = dotRef.current
    if (!svg || !curve || !dot) return

    const bars = [...svg.querySelectorAll<SVGRectElement>(".bar")]
    const motionOK = document.documentElement.classList.contains("js-anim")

    // 完成形を先に作る。以降の演出は、この状態から逆算して隠すだけにする。
    // こうしておくと JS が途中で落ちても中途半端な絵にならない。
    const len = curve.getTotalLength()
    curve.style.strokeDasharray = String(len)

    /* 点は曲線の端まで行かず、左から5本目の短冊の真ん中で止める。
       短冊の x は SVG から読む（数値をここに書き写すと二重正本になる）。
       曲線は x について等間隔ではないので、弧長を二分探索して x を合わせる。 */
    const STOP_BAR = 4
    const stopLen = (() => {
      const bar = bars[STOP_BAR]
      if (!bar) return len
      const x = bar.x.baseVal.value + bar.width.baseVal.value / 2
      let lo = 0
      let hi = len
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2
        if (curve.getPointAtLength(mid).x < x) lo = mid
        else hi = mid
      }
      return (lo + hi) / 2
    })()

    const putDot = (l: number) => {
      const p = curve.getPointAtLength(l)
      dot.setAttribute("cx", String(p.x))
      dot.setAttribute("cy", String(p.y))
    }

    const settle = () => {
      curve.style.strokeDashoffset = "0"
      for (const bar of bars) bar.style.transform = "none"
      putDot(stopLen)
    }

    if (!motionOK) {
      settle()
      return
    }

    let cancelled = false
    let guard: ReturnType<typeof setTimeout> | undefined
    let cleanup = () => {}

    // GSAP は動的に読む。読めなければ完成形のまま置く。
    void (async () => {
      let gsap
      let ScrollTrigger
      try {
        ;({ gsap } = await import("gsap"))
        ;({ ScrollTrigger } = await import("gsap/ScrollTrigger"))
      } catch {
        settle()
        return
      }
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      curve.style.strokeDashoffset = String(len)
      gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" })

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => clearTimeout(guard),
      })

      /* 保険。requestAnimationFrame が回らない環境（背景タブ、描画の止まった
         ウィンドウ、省電力時の間引き）では、上で隠したまま何も起きない。
         図が消えたままになるのは本文が消えるのと同じなので、
         一定時間たっても進んでいなければ完成形へ飛ばす。 */
      guard = setTimeout(() => {
        if (tl.progress() < 0.05) {
          tl.kill()
          gsap.set(bars, { clearProps: "all" })
          settle()
        }
      }, 2500)

      // 1. 曲線を引く
      tl.to(curve, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" })

      // 2. 短冊が左から立つ。曲線が引かれ終わる前に追いかけ始める
      tl.to(bars, { scaleY: 1, duration: 0.5, stagger: 0.045 }, 0.45)

      // 3. 点が曲線の上を走り、5本目の短冊の真ん中で止まる
      const prog = { t: 0 }
      tl.to(
        prog,
        {
          t: 1,
          duration: 1.6,
          ease: "power1.inOut",
          onUpdate: () => putDot(stopLen * prog.t),
        },
        0,
      )

      // スクロールで、層だけをゆっくり流す。文書側は動かさない
      const parallax = gsap.to(".hero__stage", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      })

      cleanup = () => {
        tl.kill()
        parallax.scrollTrigger?.kill()
        parallax.kill()
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(guard)
      cleanup()
    }
  }, [])

  return (
    <div className="hero__stage" aria-hidden="true">
      <svg
        className="axis"
        id="axis"
        ref={svgRef}
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* 元の素材と同じく、面ではなく細い縦線の束で領域を示す */}
          <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 1 0 V 4" stroke="var(--accent)" strokeWidth="1" opacity="0.34" />
          </pattern>
        </defs>

        {/* 積分領域。左から順に立ち上がる */}
        <g className="axis__bars">
          <rect className="bar" x="110.0" y="449.4" width="71.0" height="2.6" />
          <rect className="bar" x="185.0" y="446.3" width="71.0" height="5.7" />
          <rect className="bar" x="260.0" y="439.8" width="71.0" height="12.2" />
          <rect className="bar" x="335.0" y="426.5" width="71.0" height="25.5" />
          <rect className="bar" x="410.0" y="401.6" width="71.0" height="50.4" />
          <rect className="bar" x="485.0" y="360.8" width="71.0" height="91.2" />
          <rect className="bar" x="560.0" y="307.7" width="71.0" height="144.3" />
          <rect className="bar" x="635.0" y="255.5" width="71.0" height="196.5" />
          <rect className="bar" x="710.0" y="216.6" width="71.0" height="235.4" />
          <rect className="bar" x="785.0" y="193.4" width="71.0" height="258.6" />
          <rect className="bar" x="860.0" y="181.2" width="71.0" height="270.8" />
          <rect className="bar" x="935.0" y="175.2" width="71.0" height="276.8" />
          <rect className="bar" x="1010.0" y="172.4" width="71.0" height="279.6" />
          <rect className="bar" x="1085.0" y="171.1" width="71.0" height="280.9" />
        </g>

        {/* 曲線。左から引かれる */}
        <path className="axis__curve" id="curve" ref={curveRef} d="M 110.0 450.2 L 120.9 450.0 L 131.9 449.8 L 142.8 449.5 L 153.8 449.2 L 164.7 448.9 L 175.6 448.5 L 186.6 448.1 L 197.5 447.6 L 208.4 447.1 L 219.4 446.5 L 230.3 445.8 L 241.2 445.1 L 252.2 444.3 L 263.1 443.4 L 274.1 442.4 L 285.0 441.2 L 295.9 440.0 L 306.9 438.6 L 317.8 437.1 L 328.8 435.3 L 339.7 433.5 L 350.6 431.4 L 361.6 429.1 L 372.5 426.5 L 383.4 423.8 L 394.4 420.7 L 405.3 417.4 L 416.2 413.7 L 427.2 409.8 L 438.1 405.5 L 449.1 400.9 L 460.0 395.9 L 470.9 390.6 L 481.9 384.9 L 492.8 378.9 L 503.8 372.5 L 514.7 365.8 L 525.6 358.8 L 536.6 351.5 L 547.5 344.0 L 558.4 336.3 L 569.4 328.4 L 580.3 320.4 L 591.2 312.3 L 602.2 304.2 L 613.1 296.2 L 624.1 288.3 L 635.0 280.5 L 645.9 272.9 L 656.9 265.5 L 667.8 258.4 L 678.8 251.6 L 689.7 245.1 L 700.6 239.0 L 711.6 233.2 L 722.5 227.7 L 733.4 222.7 L 744.4 217.9 L 755.3 213.5 L 766.2 209.5 L 777.2 205.8 L 788.1 202.3 L 799.1 199.2 L 810.0 196.3 L 820.9 193.7 L 831.9 191.3 L 842.8 189.2 L 853.8 187.2 L 864.7 185.5 L 875.6 183.9 L 886.6 182.4 L 897.5 181.2 L 908.4 180.0 L 919.4 178.9 L 930.3 178.0 L 941.2 177.2 L 952.2 176.4 L 963.1 175.7 L 974.1 175.1 L 985.0 174.6 L 995.9 174.1 L 1006.9 173.6 L 1017.8 173.3 L 1028.8 172.9 L 1039.7 172.6 L 1050.6 172.3 L 1061.6 172.1 L 1072.5 171.8 L 1083.4 171.6 L 1094.4 171.5 L 1105.3 171.3 L 1116.2 171.2 L 1127.2 171.0 L 1138.1 170.9 L 1149.1 170.8 L 1160.0 170.7" />

        {/* 曲線の上を走る点 */}
        <circle className="axis__dot" id="dot" ref={dotRef} r="6.5" cx="110" cy="452" />

        {/* 軸 */}
        <g className="axis__lines">
          <path d="M 110 116 V 470" />
          <path d="M 44 452 H 1180" />
        </g>
        <g className="axis__heads">
          <path d="M 110 106 l -7 14 h 14 Z" />
          <path d="M 1190 452 l -14 -7 v 14 Z" />
        </g>
        <g className="axis__labels">
          <text x="88" y="474">O</text>
          <text x="128" y="122">y</text>
          <text x="1174" y="438">x</text>
        </g>
      </svg>
    </div>
  )
}
