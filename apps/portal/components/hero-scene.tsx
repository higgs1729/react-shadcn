"use client"

import { useEffect, useRef } from "react"

/* ヒーローの 3D 版の入口。描くのは lib/hero-three.ts で、ここは読み込みと切り替えだけ。
 *
 * 3D を試すかは <head> のインラインスクリプトが先に決め、html に hero-3d を付ける
 * （WebGL2 があるときだけ。動きを減らす設定でも 3D を出す。本人 2026-11-23）。
 * 付いていなければ何も読まず、今までの 2D（axis-figure.tsx）がそのまま動く。
 *
 * 3D になるのは図（座標系と短冊）と、ヒーローの 3 行（ロゴ行・見出し・小見出し）の字。
 * 3D にできた行には hero-3d-text を付け、HTML の字は CSS で透明にする（消さない）。
 *
 * 読み込みの間は .loader（portal-landing.tsx のマークアップ）を被せ、進み具合を
 * 曲線の長さと数字で見せる。three の読み込みが 1/4、止め絵（ポスター）のダウンロードが 3/4。
 * 決めた時間までに読み込み（three・止め絵・字形）が揃わなければ 2D に戻す。CSS 側にも同じ保険がある。
 *
 * 映像は待たない（本人のスマホで 3D が出ない件を直した。本人 2026-11-25）。
 * 前は映像を Blob で落として loadeddata を待ってから描き始めていたが、iOS の Safari は
 * preload を守らず play() されるまで最初のコマを読まない・低電力モードでは muted でも
 * play() を拒む・DOM に無い video の play() は操作が要る、のどれでも loadeddata が来ず、
 * 8 秒で 2D に落ちていた（Playwright の WebKit では Blob の URL の mp4 が読めず落ちた）。
 * 今は短冊に止め絵（hero-reel-poster.webp。アトラスの 1 コマ）を貼って先に出し、
 * 映像が回りだしたら lib/hero-three.ts が差し替える。映像が回らない環境でも 3D は出る。
 * 映像は URL をそのまま src にし（Blob にしない）、DOM に置いて（2px・canvas の下）play() を呼ぶ。
 * src と play() は止め絵と three が揃ってから。先に落とし始めると、遅い回線で止め絵と three の
 * 帯域を奪い、最初の1枚が 8 秒の見切りに近づく（Slow 4G 模擬で前の作りは 8 秒中 7.7 秒かかった）。
 * 拒まれたら、最初に画面に触れたときにもう一度 play() を呼ぶ。
 *
 * 結果は html の data-hero3d（ok / off）と window の "portal:hero3d" で知らせる。
 * axis-figure.tsx はそれを待ってから 2D の演出を始める。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const GIVE_UP_MS = 8000

export const HERO3D_EVENT = "portal:hero3d"

async function fetchWithProgress(
  url: string,
  type: string,
  onProgress: (fraction: number) => void,
) {
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
  return new Blob(chunks as BlobPart[], { type })
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const canvas = canvasRef.current
    const hero = canvas?.closest<HTMLElement>(".hero")
    const stage = hero?.querySelector<HTMLElement>(".hero__stage")
    const svg = stage?.querySelector<SVGSVGElement>("svg.axis")
    const textElements = hero
      ? [...hero.querySelectorAll<HTMLElement>(".hero__mark, .hero__t, .hero__lead")]
      : []
    const loader = document.querySelector<HTMLElement>(".loader")
    const number = loader?.querySelector<HTMLElement>(".loader__n")

    let settled = false
    let disposed = false
    let posterUrl = ""
    let video: HTMLVideoElement | undefined
    let handle: { dispose: () => void } | undefined

    const decide = (ok: boolean) => {
      if (settled) return
      settled = true
      root.dataset.hero3d = ok ? "ok" : "off"
      if (ok) root.classList.add("hero-3d-ready")
      else root.classList.remove("hero-3d")
      window.dispatchEvent(new CustomEvent(HERO3D_EVENT, { detail: { ok } }))
    }

    if (!root.classList.contains("hero-3d") || !canvas || !hero || !stage || !svg) {
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

    // 映像を流しっぱなしにしない（2D に戻ったら読み込みも止める）
    const dropVideo = () => {
      window.removeEventListener("pointerdown", retryPlay, true)
      window.removeEventListener("keydown", retryPlay, true)
      if (!video) return
      video.pause()
      video.removeAttribute("src")
      video.load()
      video.remove()
      video = undefined
    }
    // 自動再生を拒まれた環境（iOS の低電力モードなど）でも、利用者の操作の中で呼べば回る
    const retryPlay = () => {
      if (video?.paused && !document.hidden) void video.play().catch(() => {})
    }
    const fail = () => {
      handle?.dispose()
      handle = undefined
      dropVideo()
      decide(false)
    }
    const giveUp = window.setTimeout(fail, GIVE_UP_MS)

    const reel = window.innerWidth < 768 ? "hero-reel-sm.mp4" : "hero-reel.mp4"

    // 映像の要素。display:none / visibility:hidden / DOM の外だと「見えない」扱いで
    // play() に操作が要る（WebKit）ので、2px の大きさで canvas の下（canvas が上に重なる）に置く
    video = document.createElement("video")
    video.className = "hero__reel"
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.playsInline = true
    video.preload = "auto"
    video.setAttribute("muted", "")
    video.setAttribute("playsinline", "")
    video.setAttribute("aria-hidden", "true")
    video.style.cssText =
      "position:absolute;left:0;top:0;width:2px;height:2px;z-index:0;pointer-events:none"
    canvas.before(video)

    void Promise.all([
      import("../lib/hero-three").then((mod) => {
        moduleDone = 1
        paint()
        return mod
      }),
      // 止め絵（約 110KB）。映像（スマホ 330KB・PC 1.1MB）を待たずに、これで最初の1枚を出す
      fetchWithProgress(`${basePath}/hero/hero-reel-poster.webp`, "image/webp", (fraction) => {
        bytesDone = fraction
        paint()
      }).then(async (blob) => {
        const image = new Image()
        posterUrl = URL.createObjectURL(blob)
        image.src = posterUrl
        await image.decode()
        return image
      }),
      // 3 行の字の字形（約 23KB）。止め絵に比べて小さいので進み具合には数えない
      fetch(`${basePath}/hero/hero-text.json`).then((response) => {
        if (!response.ok) throw new Error(`hero text: ${response.status}`)
        return response.json() as Promise<unknown>
      }),
    ])
      .then(([mod, poster, fontData]) => {
        if (disposed || settled || !video) return
        // 見切りの時計は読み込みだけに掛ける。ここからの組み立て（字形・映り込み・シェーダ）は
        // 主スレッドを塞ぐので、遅い端末では時計の発火が後ろへずれ、出せる 3D を競り負けで 2D に
        // 落とすことがある（CPU 4 倍遅の模擬で組み立てに 1.6〜2.2 秒。本人 2026-11-25）。
        // 組み立てで投げた例外は下の catch が受けて 2D に戻す
        window.clearTimeout(giveUp)
        // iOS は play() されて初めて映像のデータを読みに行く
        video.src = `${basePath}/hero/${reel}`
        void video.play().catch(() => {
          window.addEventListener("pointerdown", retryPlay, true)
          window.addEventListener("keydown", retryPlay, true)
        })
        handle = mod.startHeroScene({
          canvas,
          hero,
          stage,
          svg,
          video,
          poster,
          fontData,
          textElements,
          onReady: (built) => {
            for (const el of built) el.classList.add("hero-3d-text")
            decide(true)
          },
        })
      })
      .catch(fail)

    return () => {
      disposed = true
      window.clearTimeout(giveUp)
      handle?.dispose()
      dropVideo()
      for (const el of textElements) el.classList.remove("hero-3d-text")
      if (posterUrl) URL.revokeObjectURL(posterUrl)
    }
  }, [])

  return <canvas className="hero__gl" ref={canvasRef} aria-hidden="true" />
}
