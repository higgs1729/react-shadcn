"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const DEFAULT_WIDTH = 256
const MIN_WIDTH = 208
const MAX_WIDTH = 384
const STEP = 16

function clampWidth(width: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))
}

/**
 * Pattern-level replacement for SidebarRail. The base SidebarRail only toggles
 * the sidebar; this rail exposes the width affordance it visually suggests.
 */
export function ResizableSidebarRail({ className }: { className?: string }) {
  const [width, setWidth] = React.useState(DEFAULT_WIDTH)

  const applyWidth = React.useCallback((nextWidth: number) => {
    const clampedWidth = clampWidth(nextWidth)
    setWidth(clampedWidth)
    document
      .querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')
      ?.style.setProperty("--sidebar-width", `${clampedWidth}px`)
  }, [])

  return (
    <button
      type="button"
      data-slot="resizable-sidebar-rail"
      role="separator"
      aria-label="Resize sidebar"
      aria-orientation="vertical"
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize sidebar. Double-click to reset."
      onPointerDown={(event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
        applyWidth(event.clientX)
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }}
      onDoubleClick={() => applyWidth(DEFAULT_WIDTH)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          applyWidth(width - STEP)
        }
        if (event.key === "ArrowRight") {
          event.preventDefault()
          applyWidth(width + STEP)
        }
        if (event.key === "Home") {
          event.preventDefault()
          applyWidth(MIN_WIDTH)
        }
        if (event.key === "End") {
          event.preventDefault()
          applyWidth(MAX_WIDTH)
        }
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 cursor-col-resize touch-none outline-hidden transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-transparent hover:after:bg-primary/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:after:bg-primary md:flex",
        "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0 group-data-[side=left]:-right-2",
        className
      )}
    />
  )
}
