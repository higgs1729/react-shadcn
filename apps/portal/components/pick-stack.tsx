"use client"

import { useState } from "react"

import { useHydrated } from "../lib/use-hydrated"
import { imagePath, type Shot } from "../lib/works"

// 重ねた3枚は、押すと順番が入れ替わる。3回で一周。
// 開いた形が初期値で、閉じて戻す動きは portal-motion が付ける。
// 操作できることは JS が入ってから伝える。JS が無ければただの重ね絵で、
// 押せる見た目にもしない（role も tabIndex もクライアントで初めて付く）。
export function PickStack({ name, shots }: { name: string; shots: Shot[] }) {
  const [front, setFront] = useState(0)
  // 初回描画はサーバーと同じ静的な重ね絵。押せる状態はマウント後に付ける。
  const interactive = useHydrated()

  const rotate = () => setFront((value) => (value + 1) % shots.length)

  // 手前 (--1) から奥 (--3) へ。front が進むと役割が1つずつずれる。
  const roleOf = (index: number) =>
    ((index + shots.length - front) % shots.length) + 1

  const frontShot = shots[front]

  return (
    <div
      className="pick__stack"
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        interactive
          ? `${name} の画像 ${front + 1}/${shots.length}：${frontShot.caption}。押すと次の画像に変わります`
          : undefined
      }
      onClick={interactive ? rotate : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key !== "Enter" && event.key !== " ") return
              event.preventDefault()
              rotate()
            }
          : undefined
      }
    >
      {shots.map((shot, index) => {
        const role = roleOf(index)
        const isFront = role === 1
        return (
          // eslint-disable-next-line @next/next/no-img-element -- 静的 export。寸法は素材で決まっている
          <img
            key={shot.src}
            className={`pick__img pick__img--${role}`}
            src={imagePath(shot.src)}
            width="1000"
            height="625"
            loading="lazy"
            alt={isFront ? shot.caption : ""}
            aria-hidden={isFront ? undefined : true}
          />
        )
      })}
    </div>
  )
}
