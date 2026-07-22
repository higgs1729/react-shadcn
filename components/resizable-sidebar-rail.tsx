"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  applySidebarWidth,
  clampSidebarWidth,
  readStoredSidebarWidth,
  SIDEBAR_RESIZING_ATTR,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_STEP,
  writeStoredSidebarWidth,
} from "@/lib/sidebar-width"

/**
 * Pattern-level replacement for SidebarRail. The base SidebarRail only toggles
 * the sidebar; this rail exposes the width affordance it visually suggests.
 *
 * 幅は `<html>` の CSS 変数1本(`lib/sidebar-width.ts`)に書き、localStorage へ
 * 永続化する。`variant` は rail をサイドバーの見た目の縁に合わせるためだけに使う
 * ── inset/floating は container 側に p-2 があり、既定 variant とは縁の位置が
 * 8px ずれるため。
 */
export function ResizableSidebarRail({
  className,
  variant = "sidebar",
}: {
  className?: string
  variant?: "sidebar" | "floating" | "inset"
}) {
  const railRef = React.useRef<HTMLButtonElement>(null)
  const dragRef = React.useRef<{ pointerX: number; width: number } | null>(null)
  const [width, setWidth] = React.useState(SIDEBAR_WIDTH_DEFAULT)
  // 描画とは別に「今の幅」を同期で持つ。pointerup / keydown はここを読むので、
  // state の反映待ちで1手ぶん古い値を保存してしまうことがない。
  const widthRef = React.useRef(SIDEBAR_WIDTH_DEFAULT)

  // 保存幅は pre-paint スクリプトが既に <html> へ当てているので、ここは
  // aria-valuenow とドラッグ起点を実際の幅に合わせるための同期。
  React.useLayoutEffect(() => {
    const stored = readStoredSidebarWidth()
    if (stored !== null) {
      widthRef.current = stored
      setWidth(stored)
      applySidebarWidth(stored)
    }
  }, [])

  const applyWidth = React.useCallback((nextWidth: number) => {
    const clamped = clampSidebarWidth(nextWidth)
    widthRef.current = clamped
    setWidth(clamped)
    applySidebarWidth(clamped)
    return clamped
  }, [])

  // data-side は Sidebar が描画時に付けるので、ref が埋まった後=イベント発火時に
  // 読む。render 時に読むと初回は null で、右サイドバーの初回ドラッグが逆に動く。
  const isRightSide = React.useCallback(
    () =>
      railRef.current
        ?.closest('[data-slot="sidebar"]')
        ?.getAttribute("data-side") === "right",
    []
  )

  // ドラッグ中は sidebar-gap / sidebar-container の width transition が
  // 追従を 200ms 遅らせるので、その間だけ切る(globals.css 側で解除)。
  const setResizing = React.useCallback((resizing: boolean) => {
    if (resizing) {
      document.documentElement.setAttribute(SIDEBAR_RESIZING_ATTR, "true")
    } else {
      document.documentElement.removeAttribute(SIDEBAR_RESIZING_ATTR)
    }
  }, [])

  const commit = React.useCallback((nextWidth: number) => {
    writeStoredSidebarWidth(nextWidth)
  }, [])

  return (
    <button
      ref={railRef}
      type="button"
      data-slot="resizable-sidebar-rail"
      role="separator"
      aria-label="Resize sidebar"
      aria-orientation="vertical"
      aria-valuemin={SIDEBAR_WIDTH_MIN}
      aria-valuemax={SIDEBAR_WIDTH_MAX}
      aria-valuenow={width}
      aria-valuetext={`${width}px`}
      tabIndex={0}
      title="Drag to resize sidebar. Double-click to reset."
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        // 掴んだ位置と現在幅を基準にした相対移動。clientX をそのまま幅に使うと
        // rail の掴んだ点の分だけ最初にカクッと飛ぶ。
        dragRef.current = { pointerX: event.clientX, width: widthRef.current }
        setResizing(true)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag) return
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

        const delta = event.clientX - drag.pointerX
        applyWidth(drag.width + (isRightSide() ? -delta : delta))
      }}
      onPointerUp={(event) => {
        if (!dragRef.current) return
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
        dragRef.current = null
        setResizing(false)
        commit(widthRef.current)
      }}
      onPointerCancel={() => {
        if (!dragRef.current) return
        dragRef.current = null
        setResizing(false)
        commit(widthRef.current)
      }}
      onDoubleClick={() => commit(applyWidth(SIDEBAR_WIDTH_DEFAULT))}
      onKeyDown={(event) => {
        const right = isRightSide()
        const shrink = right ? "ArrowRight" : "ArrowLeft"
        const grow = right ? "ArrowLeft" : "ArrowRight"

        const resize = (next: number) => {
          event.preventDefault()
          // rail は sidebar の中にあるので、止めないと矢印キーが
          // SidebarMenuBar のロービングフォーカスまで届いて画面遷移してしまう。
          event.stopPropagation()
          commit(applyWidth(next))
        }

        if (event.key === shrink) {
          resize(widthRef.current - SIDEBAR_WIDTH_STEP)
        }
        if (event.key === grow) {
          resize(widthRef.current + SIDEBAR_WIDTH_STEP)
        }
        if (event.key === "Home") {
          resize(SIDEBAR_WIDTH_MIN)
        }
        if (event.key === "End") {
          resize(SIDEBAR_WIDTH_MAX)
        }
        if (event.key === "Enter" || event.key === " ") {
          resize(SIDEBAR_WIDTH_DEFAULT)
        }
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 cursor-col-resize touch-none select-none outline-hidden transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-transparent hover:after:bg-primary/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:after:bg-primary md:flex",
        // 折りたたみ中は幅を変える対象が無いので、掴めないようにする。
        "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0",
        "group-data-[collapsible=offcanvas]:pointer-events-none group-data-[collapsible=offcanvas]:opacity-0",
        variant === "sidebar"
          ? "group-data-[side=left]:-right-2 group-data-[side=right]:-left-2"
          : "group-data-[side=left]:right-0 group-data-[side=right]:left-0",
        className
      )}
    />
  )
}
