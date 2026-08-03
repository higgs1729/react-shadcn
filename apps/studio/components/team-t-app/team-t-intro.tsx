"use client"

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { findCatalogItem } from "@/lib/team-t-app/catalog"
import { introPages, type IntroApiEntry } from "@/lib/team-t-app/intro-tour"

import { IntroApiCard } from "./intro-api-card"

interface TeamTIntroProps {
  /**
   * 表示中のページ(1始まり)。タブを離れると component は unmount されるため、
   * 読んでいた位置を失わないよう状態は shell 側が所有する。
   */
  pageNumber: number
  onPageChange: (pageNumber: number) => void
  /** メインAPIの「デモを見る」から、そのAPIのウィンドウを新規に開く */
  onDemoOpen: (id: string) => void
}

/** catalog.json を正本とし、intro-tour.ts の id から表示内容を解決する。 */
function resolveEntry(entry: IntroApiEntry) {
  const item = findCatalogItem(entry.id)
  return item ? { entry, item } : null
}

export function TeamTIntro({
  pageNumber,
  onPageChange,
  onDemoOpen,
}: TeamTIntroProps) {
  const total = introPages.length
  const page = introPages[pageNumber - 1] ?? introPages[0]
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  const main = resolveEntry(page.main)
  const others = page.others.flatMap((entry) => {
    const resolved = resolveEntry(entry)
    return resolved ? [resolved] : []
  })

  // ページ送り後は見出しへ移動させ、キーボード利用者が先頭から読み直せるようにする。
  // 初回マウント時は動かさない（紹介タブを開いた直後にスクロール位置を奪わないため）。
  const mountedRef = React.useRef(false)
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    headingRef.current?.focus()
  }, [pageNumber])

  return (
    <div className="h-[calc(100svh-3.5rem)] scrollbar-gutter-stable overflow-y-auto">
      <section className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--team-t-gold-line)] pb-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-[color:var(--team-t-gold-strong)] uppercase">
              <BookOpenIcon className="size-4" aria-hidden="true" />
              Team T API Lab の紹介
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-2 text-2xl font-semibold tracking-tight text-foreground outline-none md:text-3xl"
            >
              このアプリで触れるAPI
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-semibold tabular-nums text-[color:var(--team-t-gold-strong)]">
                {pageNumber}
              </span>{" "}
              / {total}
            </p>
            <div className="flex gap-1.5">
              {introPages.map((candidate) => {
                const active = candidate.page === pageNumber
                return (
                  <button
                    key={candidate.page}
                    type="button"
                    aria-label={`${candidate.page}ページ目へ`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => onPageChange(candidate.page)}
                    className={`size-2.5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      active
                        ? "bg-[color:var(--team-t-gold)]"
                        : "bg-muted-foreground/35 hover:bg-muted-foreground/60"
                    }`}
                  />
                )
              })}
            </div>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {main ? (
            <IntroApiCard
              entry={main.entry}
              item={main.item}
              variant="main"
              onDemoOpen={onDemoOpen}
            />
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {others.map(({ entry, item }) => (
              <IntroApiCard
                key={entry.id}
                entry={entry}
                item={item}
                variant="sub"
              />
            ))}
          </div>
        </div>

        <nav
          aria-label="紹介ページの移動"
          className="mt-8 flex items-center justify-between border-t border-[color:var(--team-t-gold-line)] pt-5"
        >
          <Button
            type="button"
            variant="outline"
            disabled={pageNumber === 1}
            onClick={() => onPageChange(pageNumber - 1)}
            className="border-[color:var(--team-t-gold-line)] text-[color:var(--team-t-gold-strong)] hover:bg-primary/25 hover:text-[color:var(--team-t-gold-strong)]"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            前へ
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pageNumber === total}
            onClick={() => onPageChange(pageNumber + 1)}
            className="border-[color:var(--team-t-gold-line)] text-[color:var(--team-t-gold-strong)] hover:bg-primary/25 hover:text-[color:var(--team-t-gold-strong)]"
          >
            次へ
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </nav>
      </section>
    </div>
  )
}
