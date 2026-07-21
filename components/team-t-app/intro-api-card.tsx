"use client"

import * as React from "react"
import { ChevronRightIcon, PlayIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getApiPageUrl, type ApiCatalogItem } from "@/lib/team-t-app/catalog"
import type { IntroApiEntry } from "@/lib/team-t-app/intro-tour"

import { CategoryIcon } from "./category-icon"

// iframe を「縮小したデスクトップ画面」として見せるための基準サイズ。
// 実寸で描画してから ResizeObserver で測った幅に合わせて scale する。
const PREVIEW_WIDTH = 1280
const PREVIEW_HEIGHT = 720

/** intro-tour.ts の javaCode は可読性のためインデント付きで書かれているので、表示前に揃える。 */
function dedent(code: string) {
  const lines = code.replace(/^\n+/, "").replace(/\s+$/, "").split("\n")
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length)
  const shortest = indents.length ? Math.min(...indents) : 0
  return lines.map((line) => line.slice(shortest)).join("\n")
}

function LivePreview({
  item,
  variant,
}: {
  item: ApiCatalogItem
  variant: "main" | "sub"
}) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(0)

  React.useEffect(() => {
    const element = frameRef.current
    if (!element) return
    // ResizeObserver の初回通知は環境によって飛ばないため、マウント時に必ず自分で測る。
    const measure = () => {
      const width = element.getBoundingClientRect().width
      if (width) setScale(width / PREVIEW_WIDTH)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  return (
    <div
      ref={frameRef}
      className={`relative w-full overflow-hidden rounded-lg border border-[color:var(--team-t-gold-line)] bg-white ${
        variant === "main" ? "aspect-[16/9]" : "aspect-[16/10]"
      }`}
    >
      <iframe
        title={`${item.title} のプレビュー`}
        src={getApiPageUrl(item)}
        loading="lazy"
        scrolling="no"
        tabIndex={-1}
        referrerPolicy="strict-origin-when-cross-origin"
        // 静止プレビューなので操作は受け付けない。触るのは「デモを見る」から開く実タブ。
        className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      />
    </div>
  )
}

interface IntroApiCardProps {
  entry: IntroApiEntry
  item: ApiCatalogItem
  variant: "main" | "sub"
  onDemoOpen?: (id: string) => void
}

export function IntroApiCard({
  entry,
  item,
  variant,
  onDemoOpen,
}: IntroApiCardProps) {
  const isMain = variant === "main"

  return (
    <article
      // min-w-0: grid item の min-content が中の長いラベルに引っ張られて広がるのを防ぐ
      className={`flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 ${
        isMain
          ? "border-[color:var(--team-t-gold-line)] shadow-[0_0_0_1px_rgba(183,156,255,0.12),0_0_28px_rgba(139,92,246,0.22)] md:p-6"
          : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {isMain ? (
          <Badge className="border-[color:var(--team-t-gold-line)] bg-primary text-[color:var(--team-t-gold-strong)]">
            メインAPI
          </Badge>
        ) : null}
        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
          <CategoryIcon category={item.category} className="size-3" />
          {item.category}
        </Badge>
      </div>

      <div>
        <h3
          className={`font-semibold text-foreground ${isMain ? "text-2xl" : "text-lg"}`}
        >
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{item.apiName}</p>
      </div>

      <LivePreview item={item} variant={variant} />

      <p className="text-sm leading-relaxed text-foreground/85">
        {item.description}
      </p>

      <Collapsible>
        <CollapsibleTrigger
          data-team-t-code-trigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              // Button 既定の whitespace-nowrap のままだとメソッド名が長い時に card 幅を押し広げる
              className="h-auto w-full justify-start py-2 text-left whitespace-normal text-[color:var(--team-t-gold)] hover:bg-primary/20 hover:text-[color:var(--team-t-gold-strong)]"
            />
          }
        >
          <ChevronRightIcon data-chevron data-icon="inline-start" />
          Javaの実装コードを見る（{entry.javaMethodNames.join(" / ")}）
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-border bg-black/45 p-3 text-xs leading-relaxed">
            <code className="text-foreground/85">{dedent(entry.javaCode)}</code>
          </pre>
        </CollapsibleContent>
      </Collapsible>

      {isMain && onDemoOpen ? (
        <Button
          type="button"
          onClick={() => onDemoOpen(item.id)}
          className="self-start border border-[color:var(--team-t-gold-line)] bg-primary text-white shadow-[0_0_0_1px_rgba(183,156,255,0.12),0_0_24px_rgba(139,92,246,0.4)] hover:bg-primary/85"
        >
          <PlayIcon data-icon="inline-start" />
          デモを見る →
        </Button>
      ) : null}
    </article>
  )
}
