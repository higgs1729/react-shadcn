"use client"

import { useEffect } from "react"

/* 08 — 文書側の出現。main.js のうち「動き」の部分。
 *
 * 集中版なので、ここで動かしてよいのは次の2つだけ。
 *   1. 文章のタイプ表示と段階的な出現
 *   2. ピックアップの重ねが1回だけ開く動き
 * 見出しの送り出し、数え上げ、流れる帯といった「06 で足したもの」は入れない。
 *
 * React の外から class と textContent を触る。対象はどれも React が値を
 * 持っていない属性なので、再描画で戻されることはない。
 * DOM を直接見るのは 08 の順序（誰がいつ出るか）をそのまま写すため。
 */
export function PortalMotion() {
  useEffect(() => {
    // js-anim は layout の <head> のスクリプトが付ける。ここで付けると、
    // 一度見えたものが隠れてから出る絵になる（08 も head で付けている）。
    if (!document.documentElement.classList.contains("js-anim")) return

    const timers: ReturnType<typeof setTimeout>[] = []
    // 効果が二度走る場合（dev の StrictMode）に、タイプ表示を最初からやり直せる
    // ようにしておく。文字を消したまま止まると、見出しが空のまま残る。
    const typed: { el: HTMLElement; out: Element; text: string }[] = []
    const wait = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms))
    }
    const reveal = (el: Element | null | undefined) => {
      el?.classList.add("is-in")
    }

    /* ------------------------------------------------------------ 出現
       先にラベル、次に見出し、最後に補助文とカードを出す。 */
    const riseElements = [
      ...document.querySelectorAll(
        ".sec__label, .item, .pick, .mcard, .close__t, .close__d, .close__acts",
      ),
    ]
    for (const [index, el] of riseElements.entries()) {
      el.classList.add("rise")
      ;(el as HTMLElement).style.setProperty(
        "--rise-delay",
        `${Math.min(index, 5) * 70}ms`,
      )
    }
    document.querySelectorAll<HTMLElement>(".mcard").forEach((el, index) => {
      el.style.setProperty("--rise-delay", `${Math.min(index, 5) * 75}ms`)
    })
    document.querySelectorAll<HTMLElement>(".item").forEach((el, index) => {
      el.style.setProperty("--rise-delay", `${Math.min(index, 5) * 75}ms`)
    })

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          reveal(e.target)
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    )
    for (const el of riseElements) io.observe(el)

    /* ------------------------------------------------------- タイプ表示
       見出しは検索欄のように一文字ずつ現れ、句読点の後だけ少し間を置く。 */
    const startTyping = (el: HTMLElement | null, delay = 0) => {
      if (!el || el.dataset.typeStarted) return
      const out = el.querySelector(".typewrite__text")
      if (!out) return

      const text = (out.textContent ?? "").trim()
      typed.push({ el, out, text })
      el.dataset.typeStarted = "true"
      el.setAttribute("aria-label", text)
      out.textContent = ""
      el.classList.add("is-typing")

      const type = (index = 0) => {
        out.textContent = text.slice(0, index + 1)
        if (index + 1 < text.length) {
          const pause = /[、。]/.test(text[index]) ? 240 : 48
          wait(() => type(index + 1), pause)
          return
        }

        el.classList.add("is-complete")
        const hero = el.closest(".hero__inner")
        const lead =
          hero?.querySelector(".hero__lead") ??
          el.closest(".sec")?.querySelector(".sec__lead")
        if (lead) wait(() => reveal(lead), hero ? 360 : 320)
        if (hero) wait(() => reveal(hero.querySelector(".hero__acts")), 920)
      }

      wait(() => type(), delay)
    }

    reveal(document.querySelector(".hero__mark"))
    startTyping(document.querySelector<HTMLElement>(".hero__t.typewrite"), 360)

    const typeObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          reveal(e.target.closest(".sec")?.querySelector(".sec__label"))
          startTyping(e.target as HTMLElement, 220)
          observer.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.2 },
    )
    for (const el of document.querySelectorAll(".sec .typewrite")) {
      typeObserver.observe(el)
    }

    /* --------------------------------------------------- 重ねが開く
       開いた形が初期値。ここで閉じてから、画面に入ったときに1回だけ開く。
       rAF が回らない環境では出現の観測が届かないことがあるので、
       一定時間たっても閉じたままなら開く（axis.js と同じ保険）。 */
    const picks = [...document.querySelectorAll(".pick")]
    const open = (el: Element) => {
      if (!el.classList.contains("is-closed")) return
      el.classList.add("is-open")
      el.classList.remove("is-closed")
    }
    for (const el of picks) el.classList.add("is-closed")

    const stackObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          open(e.target)
          observer.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    )
    for (const el of picks) stackObserver.observe(el)

    // 観測が一度も届かなかったときだけ、いま画面に入っているものを開く。
    // 全部まとめて開くと、下にあるぶんの動きが先に消えてしまうのでしない。
    wait(() => {
      for (const el of picks) {
        const r = el.getBoundingClientRect()
        if (r.top < innerHeight && r.bottom > 0) open(el)
      }
    }, 2500)

    return () => {
      for (const timer of timers) clearTimeout(timer)
      for (const { el, out, text } of typed) {
        out.textContent = text
        el.classList.remove("is-typing", "is-complete")
        delete el.dataset.typeStarted
      }
      io.disconnect()
      typeObserver.disconnect()
      stackObserver.disconnect()
    }
  }, [])

  return null
}
