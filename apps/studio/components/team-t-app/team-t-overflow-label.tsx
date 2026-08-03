"use client"

import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const teamTOverflowTooltipDelayMs = 600

interface TeamTOverflowLabelProps {
  text: string
  lines?: 1 | 2
  className?: string
  side?: React.ComponentProps<typeof TooltipContent>["side"]
  align?: React.ComponentProps<typeof TooltipContent>["align"]
}

export function TeamTOverflowLabel({
  text,
  lines = 1,
  className,
  side = "top",
  align = "center",
}: TeamTOverflowLabelProps) {
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = React.useState(false)
  const [hoverOpen, setHoverOpen] = React.useState(false)
  const [focusOpen, setFocusOpen] = React.useState(false)

  React.useEffect(() => {
    const label = labelRef.current
    if (!label) return

    const measure = () => {
      const nextOverflowing =
        label.scrollWidth > label.clientWidth + 1 ||
        label.scrollHeight > label.clientHeight + 1
      setIsOverflowing(nextOverflowing)
      if (!nextOverflowing) {
        setHoverOpen(false)
        setFocusOpen(false)
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(label)
    window.addEventListener("resize", measure)
    document.fonts?.ready.then(measure).catch(() => {})

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [lines, text])

  React.useEffect(() => {
    const label = labelRef.current
    if (!label) return

    const overflowRoot = label.closest("[data-team-t-overflow-root]")
    const interactionTarget =
      label.closest<HTMLElement>("button, a[href], [role='tab']") ??
      overflowRoot?.querySelector<HTMLElement>("[role='tab'], button, a[href]")

    if (!interactionTarget) return

    let hoverTimer: number | undefined
    const showAfterDelay = () => {
      window.clearTimeout(hoverTimer)
      hoverTimer = window.setTimeout(
        () => setHoverOpen(true),
        teamTOverflowTooltipDelayMs
      )
    }
    const hideHover = () => {
      window.clearTimeout(hoverTimer)
      setHoverOpen(false)
    }
    const showOnFocus = () => setFocusOpen(true)
    const hideFocus = () => setFocusOpen(false)

    interactionTarget.addEventListener("pointerenter", showAfterDelay)
    interactionTarget.addEventListener("pointerleave", hideHover)
    interactionTarget.addEventListener("focus", showOnFocus)
    interactionTarget.addEventListener("blur", hideFocus)

    return () => {
      window.clearTimeout(hoverTimer)
      interactionTarget.removeEventListener("pointerenter", showAfterDelay)
      interactionTarget.removeEventListener("pointerleave", hideHover)
      interactionTarget.removeEventListener("focus", showOnFocus)
      interactionTarget.removeEventListener("blur", hideFocus)
    }
  }, [])

  return (
    <Tooltip
      disabled={!isOverflowing}
      open={isOverflowing && (hoverOpen || focusOpen)}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return
        setHoverOpen(false)
        setFocusOpen(false)
      }}
    >
      <TooltipTrigger
        disabled={!isOverflowing}
        render={
          <span
            ref={labelRef}
            className={cn(
              "min-w-0",
              lines === 1
                ? "block truncate"
                : "line-clamp-2 whitespace-normal",
              className
            )}
          >
            {text}
          </span>
        }
      />
      <TooltipContent
        side={side}
        align={align}
        className="max-w-72 break-words text-pretty"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
