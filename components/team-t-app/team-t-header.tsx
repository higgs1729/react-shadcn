"use client"

import { BookOpenIcon, CompassIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { ApiPageIcon } from "./category-icon"

/**
 * 探索と紹介はどちらも apiId を持たないため、apiId の有無だけでは種別を判別できない。
 * 描画とタブ切替の分岐は kind を正本にする。
 */
export type TeamTWindowKind = "explore" | "intro" | "api"

export interface TeamTWindow {
  id: string
  kind: TeamTWindowKind
  apiId: string | null
  title: string
}

const windowIcons = {
  explore: CompassIcon,
  intro: BookOpenIcon,
  api: ApiPageIcon,
} as const

interface TeamTHeaderProps {
  windows: readonly TeamTWindow[]
  activeWindowId: string
  onWindowNew: () => void
  onWindowSwitch: (id: string) => void
  onWindowClose: (id: string) => void
}

export function TeamTHeader({
  windows,
  activeWindowId,
  onWindowNew,
  onWindowSwitch,
  onWindowClose,
}: TeamTHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 overflow-x-auto border-b border-border bg-background/95 px-2 backdrop-blur">
      <SidebarTrigger
        className="shrink-0 hover:bg-primary/25 hover:text-[color:var(--team-t-gold-strong)]"
        aria-label="APIカタログを開く"
      />
      <div
        className="flex min-w-0 flex-1 items-stretch gap-1.5 self-stretch"
        role="tablist"
        aria-label="開いているAPI"
      >
        {windows.map((window) => {
          const active = window.id === activeWindowId
          const Icon = windowIcons[window.kind]
          return (
            <div
              key={window.id}
              data-active={active}
              className="relative flex max-w-56 items-center justify-center gap-1.5 rounded-t-md bg-[linear-gradient(to_top,rgba(155,108,255,0.32),rgba(155,108,255,0.06)_62%,transparent)] py-1 pr-1.5 pl-3 text-sm data-[active=false]:bg-none data-[active=false]:text-muted-foreground data-[active=false]:hover:bg-accent/60"
            >
              <button
                type="button"
                role="tab"
                aria-label={`${window.title}に切り替え`}
                aria-selected={active}
                className="absolute inset-0 rounded-t-md outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                onClick={() => onWindowSwitch(window.id)}
              />
              <Icon
                aria-hidden="true"
                className={`pointer-events-none relative size-4 shrink-0 ${active ? "text-[#b79cff]" : ""}`}
              />
              <span className="pointer-events-none relative min-w-0 truncate text-center font-medium">
                {window.title}
              </span>
              <button
                type="button"
                aria-label={`${window.title}を閉じる`}
                className="relative z-10 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-hidden after:absolute after:-inset-1 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onWindowClose(window.id)}
              >
                <XIcon className="size-4" />
              </button>
              {active ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#b79cff] shadow-[0_0_10px_2px_rgba(155,108,255,0.75)]"
                />
              ) : null}
            </div>
          )
        })}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 self-center hover:bg-primary/25 hover:text-[color:var(--team-t-gold-strong)]"
          aria-label="新しいウィンドウを追加"
          onClick={onWindowNew}
        >
          <PlusIcon />
        </Button>
      </div>
    </header>
  )
}
