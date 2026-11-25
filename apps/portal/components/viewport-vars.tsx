"use client"

import { useEffect } from "react"

/* 見えている画面の高さ(--vvh)と、下から被さっているキーボードの高さ(--kb)を html に書く。
 *
 * スマホのキーボードは、iOS の Safari でも Android の Chrome(既定の resizes-visual)でも
 * レイアウトの画面を縮めず、上に被さるだけ。下端に固定した分身の話す欄(avatar-guide.module.css)は
 * そのままだとキーボードの裏に隠れる。visualViewport の高さとずれから被さった分を出し、
 * CSS がその分だけ欄を持ち上げて、見えている高さに収める(本人 2026-11-25「チャット欄が見切れる」)。
 * visualViewport が無いブラウザでは何も書かず、CSS の既定(0 と 100dvh)で出る。
 */
export function ViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement.style
    let raf = 0
    const write = () => {
      raf = 0
      const kb = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop))
      root.setProperty("--vvh", `${Math.round(vv.height)}px`)
      root.setProperty("--kb", `${Math.round(kb)}px`)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(write)
    }
    write()
    vv.addEventListener("resize", schedule)
    vv.addEventListener("scroll", schedule)
    return () => {
      cancelAnimationFrame(raf)
      vv.removeEventListener("resize", schedule)
      vv.removeEventListener("scroll", schedule)
      root.removeProperty("--vvh")
      root.removeProperty("--kb")
    }
  }, [])
  return null
}
