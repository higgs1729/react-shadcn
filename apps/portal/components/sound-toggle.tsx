"use client"

import { useSyncExternalStore } from "react"

/** 音を出すかの選択を知らせるイベント。detail は { on: boolean } */
export const SOUND_EVENT = "portal:sound"
const KEY = "portal:sound"

/* 音を出すかを選ぶ入口（本人 2026-11-23「このサイトは音が出る」）。
 * 音の中身はまだ無い。ここは選んだ値を覚えて知らせるだけで、鳴らす側は
 * SOUND_EVENT を聞く。既定は「出さない」（ブラウザも、押される前の音を止める）。
 * 読み込み画面の文言がこのボタンを指すので、場所（右下に固定）を変えたら文言も直す */
function read() {
  try {
    return localStorage.getItem(KEY) === "on"
  } catch {
    // 保存が使えない環境では、毎回「出さない」から始める
    return false
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(SOUND_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(SOUND_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function SoundToggle() {
  // 静的 export なので、サーバーで組む値は「出さない」に固定する
  const on = useSyncExternalStore(subscribe, read, () => false)

  const toggle = () => {
    const next = !on
    try {
      localStorage.setItem(KEY, next ? "on" : "off")
    } catch {}
    window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { on: next } }))
  }

  return (
    <button
      type="button"
      className="btn btn--tonal btn--sm sound"
      aria-pressed={on}
      onClick={toggle}
    >
      {on ? "音を出す：オン" : "音を出す：オフ"}
    </button>
  )
}
