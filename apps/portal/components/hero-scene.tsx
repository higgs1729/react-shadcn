"use client"

import { useEffect, useRef } from "react"

/* ヒーローの 3D 版の入口。描くのは lib/hero-three.ts で、ここは読み込みと切り替えだけ。
 *
 * 3D を試すかは <head> のインラインスクリプトが先に決め、html に hero-3d を付ける
 * （WebGL がある・動きを減らす設定でない・データ節約でない、のときだけ）。
 * 付いていなければ何も読まず、今までの 2D（axis-figure.tsx）がそのまま動く。
 *
 * 読み込みの間は .loader（portal-landing.tsx のマークアップ）を被せ、進み具合を
 * 曲線の長さと数字で見せる。three の読み込みが 1/4、映像のダウンロードが 3/4。
 * 決めた時間までに最初の1枚が出なければ 2D に戻す。CSS 側にも同じ保険がある。
 *
 * 結果は html の data-hero3d（ok / off）と window の "portal:hero3d" で知らせる。
 * axis-figure.tsx はそれを待ってから 2D の演出を始める。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const GIVE_UP_MS = 8000

export const HERO3D_EVENT = "portal:hero3d"

async function fetchWithProgress(url: string, onProgress: (fraction: number) => void) {
  const response = await fetch(url)
  if (!response.ok || !response.body) throw new Error(`hero reel: ${response.status}`)
  const size = Number(response.headers.get("content-length")) || 0
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (size) onProgress(Math.min(1, received / size))
  }
  onProgress(1)
  return new Blob(chunks as BlobPart[], { type: "video/mp4" })
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const canvas = canvasRef.current
    const svg = canvas?.parentElement?.querySelector<SVGSVGElement>("svg.axis")
    const loader = document.querySelector<HTMLElement>(".loader")
    const number = loader?.querySelector<HTMLElement>(".loader__n")

    let settled = false
    let disposed = false
    let videoUrl = ""
    let handle: { dispose: () => void } | undefined

    const decide = (ok: boolean) => {
      if (settled) return
      settled = true
      root.dataset.hero3d = ok ? "ok" : "off"
      if (ok) root.classList.add("hero-3d-ready")
      else root.classList.remove("hero-3d")
      window.dispatchEvent(new CustomEvent(HERO3D_EVENT, { detail: { ok } }))
    }

    if (!root.classList.contains("hero-3d") || !canvas || !svg) {
      decide(false)
      return
    }

    let moduleDone = 0
    let bytesDone = 0
    const paint = () => {
      const p = moduleDone * 0.25 + bytesDone * 0.75
      loader?.style.setProperty("--p", p.toFixed(3))
      if (number) number.textContent = String(Math.round(p * 100))
    }

    const fail = () => {
      handle?.dispose()
      handle = undefined
      decide(false)
    }
    const giveUp = window.setTimeout(fail, GIVE_UP_MS)

    const reel = window.innerWidth < 768 ? "hero-reel-sm.mp4" : "hero-reel.mp4"

    void Promise.all([
      import("../lib/hero-three").then((mod) => {
        moduleDone = 1
        paint()
        return mod
      }),
      fetchWithProgress(`${basePath}/hero/${reel}`, (fraction) => {
        bytesDone = fraction
        paint()
      }),
    ])
      .then(async ([mod, blob]) => {
        if (disposed || settled) return
        const video = document.createElement("video")
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.preload = "auto"
        videoUrl = URL.createObjectURL(blob)
        video.src = videoUrl
        await new Promise<void>((resolve, reject) => {
          video.addEventListener("loadeddata", () => resolve(), { once: true })
          video.addEventListener("error", () => reject(new Error("hero reel decode")), {
            once: true,
          })
        })
        if (disposed || settled) return
        handle = mod.startHeroScene({
          canvas,
          svg,
          video,
          onReady: () => {
            window.clearTimeout(giveUp)
            decide(true)
          },
        })
      })
      .catch(fail)

    return () => {
      disposed = true
      window.clearTimeout(giveUp)
      handle?.dispose()
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, [])

  return <canvas className="hero__gl" ref={canvasRef} aria-hidden="true" />
}
