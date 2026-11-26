"use client"

/**
 * ヒーローの背景（本人 2026-11-26）。デモリールの頭と同じ流れ（雲海に積み石の石碑と画面の列の世界 → オーブの突進
 * → 鳥の目 → 円盤 → 殺陣）を Hero 用に描き直した約 12.8 秒の輪。営業用の宣言の字・MG・CADENCE の札は載せず、
 * 石碑の画面には本人の作品を映す。
 * 作り方と素材は docs/design-direction.md「ヒーローの背景（世界）」。
 *
 * 映像は「動きを減らす」設定（prefers-reduced-motion）を見ずに、常に自動再生で流す（本人 2026-11-26）。
 * 止め絵（picture）は読み込み中の poster と、iOS の低電力モードなどで自動再生が止められたときの表示にだけ使う。
 * 映像が回りだしたら止め絵の上に重ねる。映像を待たない（2026-11-25 の 3D と同じ扱い）。
 * 縦の画面（スマホ）には縦に描いた版を渡す。画面外・裏のタブでは止める。
 */
import { useEffect, useRef } from "react"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const PORTRAIT = "(orientation: portrait)"

export function HeroWorld() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const hero = video?.closest<HTMLElement>(".hero")
    if (!video || !hero) return

    const portrait = window.matchMedia(PORTRAIT).matches
    video.muted = true
    video.src = `${basePath}/hero/${portrait ? "hero-world-portrait.mp4" : "hero-world.mp4"}`
    const onPlaying = () => video.classList.add("is-playing")
    video.addEventListener("playing", onPlaying)

    let inView = true
    const sync = () => {
      if (inView && !document.hidden) video.play().catch(() => {})
      else video.pause()
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    observer.observe(hero)
    document.addEventListener("visibilitychange", sync)

    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", sync)
      video.removeEventListener("playing", onPlaying)
      video.pause()
      video.removeAttribute("src")
      video.load()
    }
  }, [])

  return (
    <div className="hero__world" aria-hidden="true">
      <picture>
        <source media={PORTRAIT} srcSet={`${basePath}/hero/hero-world-portrait.webp`} />
        <img src={`${basePath}/hero/hero-world.webp`} alt="" decoding="async" fetchPriority="high" />
      </picture>
      <video ref={videoRef} muted loop playsInline preload="auto" />
    </div>
  )
}
