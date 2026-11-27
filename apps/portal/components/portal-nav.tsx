"use client"

import { useEffect, useRef, useState } from "react"

import { BrandMark } from "./brand-mark"

const links = [
  { id: "works", label: "Works" },
  { id: "method", label: "Method" },
  { id: "contact", label: "Contact" },
] as const

export function PortalNav() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string>(links[0].id)
  const toggle = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLElement>(null)

  // 現在地。節の上端が画面の 28% を越えたところで切り替える。
  // タブを切り替えても印は Works のまま。行き先が節である以上、節で決める。
  useEffect(() => {
    const sections = links
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!sections.length) return

    const update = () => {
      const marker = window.scrollY + window.innerHeight * 0.28
      let found = sections[0]
      for (const section of sections) {
        if (section.offsetTop <= marker) found = section
      }
      setCurrent(found.id)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("hashchange", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("hashchange", update)
    }
  }, [])

  // 広い幅では常に開いた形（CSS 側）なので、開閉状態を持ち越さない
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 52em)")
    const close = () => setOpen(false)
    wide.addEventListener("change", close)
    return () => wide.removeEventListener("change", close)
  }, [])

  // 開いている間だけ、パネルとボタンの外を押すか Esc で閉じる
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (toggle.current?.contains(target) || menu.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      // 閉じると項目が消えるので、中にあったフォーカスはボタンへ戻す
      if (menu.current?.contains(document.activeElement)) toggle.current?.focus()
      setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <header className="nav" id="nav">
      <a className="nav__brand" href="#top">
        <span className="nav__glyph" aria-hidden="true">
          <BrandMark />
        </span>
        higgs<span className="brand__number">1729</span>
      </a>
      <button
        ref={toggle}
        className="nav__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="nav-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="nav__toggle-icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="visually-hidden">
          {open ? "メニューを閉じる" : "メニューを開く"}
        </span>
      </button>
      <nav
        ref={menu}
        className={open ? "nav__links is-open" : "nav__links"}
        id="nav-menu"
        aria-label="メインナビゲーション"
      >
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            aria-current={current === link.id ? "location" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
