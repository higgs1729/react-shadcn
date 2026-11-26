"use client"

/**
 * ヒーローの背景（本人 2026-11-26）。デモリール冒頭の世界（夕暮れの雲海に、積み石の石碑と画面の列）を
 * Hero 用に描き直した 8 秒の輪。営業用の字・札・オーブは載せず、画面には本人の作品を映す。
 * 作り方と素材は docs/design-direction.md「ヒーローの背景（世界）」。
 *
 * 止め絵（picture）を先に出し、映像が回りだしたら上に重ねる。映像を待たない
 * （iOS は低電力モードや preload の無視で映像が回らないことがある。2026-11-25 の 3D と同じ扱い）。
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
