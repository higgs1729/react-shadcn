"use client"

import { CompassIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { ApiPageIcon } from "./category-icon"

export interface TeamTWindow {
  id: string
  apiId: string | null
  title: string
}

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
          const Icon = window.apiId ? ApiPageIcon : CompassIcon
          return (
            <div
              key={window.id}
              data-active={active}
              className="relative flex max-w-56 items-center justify-center gap-1.5 rounded-t-md bg-[linear-gradient(to_top,rgba(155,108,255,0.32),rgba(155,108,255,0.06)_62%,transparent)] px-4 text-sm data-[active=false]:bg-none data-[active=false]:text-muted-foreground data-[active=false]:hover:bg-accent/60"
            >
              <Icon
                aria-hidden="true"
                className={`size-4 shrink-0 ${active ? "text-[#b79cff]" : ""}`}
              />
              <button
                type="button"
                role="tab"
                aria-selected={active}
                className="min-w-0 truncate text-center font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onWindowSwitch(window.id)}
              >
                {window.title}
              </button>
              {windows.length > 1 ? (
                <button
                  type="button"
                  aria-label={`${window.title}を閉じる`}
                  className="grid size-5 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onWindowClose(window.id)}
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : (
                // ×非表示時も同じ幅を確保し、アイコンとの左右バランスを保つ
                <span aria-hidden="true" className="size-5 shrink-0" />
              )}
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
