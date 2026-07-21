"use client"

import * as React from "react"
import { ChevronRightIcon, Maximize2Icon, PlayIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getApiPageUrl, type ApiCatalogItem } from "@/lib/team-t-app/catalog"
import type { IntroApiEntry } from "@/lib/team-t-app/intro-tour"

import { CategoryIcon } from "./category-icon"
import { JavaCodeBlock } from "./java-code-block"

// iframe を「縮小したデスクトップ画面」として見せるための基準サイズ。
// 実寸で描画してから ResizeObserver で測った幅に合わせて scale する。
const PREVIEW_WIDTH = 1280
const PREVIEW_HEIGHT = 720

/**
 * ダイアログは document.body へ portal されるため、Team T の SidebarInset
 * (サイドバー右側の表示領域)の外に描画される。components/ui/dialog.tsx の
 * left-1/2 のままだとブラウザ画面全体の中央に揃い、サイドバー幅の分だけ
 * 表示領域の中心より左寄りに見えてしまう。SidebarInset を実測してその中心へ
 * left を明示的に上書きし、見つからない場合(story など)は class 側の
 * left-1/2 にフォールバックする。
 */
function useDialogCenterLeft(open: boolean) {
  const [left, setLeft] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!open) return
    const inset = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-inset"]'
    )
    if (!inset) return
    const measure = () => {
      const rect = inset.getBoundingClientRect()
      setLeft(rect.left + rect.width / 2)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(inset)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [open])

  return left
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
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const dialogLeft = useDialogCenterLeft(dialogOpen)

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
          <div className="relative mt-2">
            <JavaCodeBlock code={entry.javaCode} className="max-h-80" />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                data-team-t-code-dialog-trigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-2 right-2 z-10 border-[color:var(--team-t-gold-line)] bg-card/90 text-muted-foreground shadow-sm backdrop-blur-sm hover:text-[color:var(--team-t-gold-strong)]"
                  />
                }
              >
                <Maximize2Icon />
                <span className="sr-only">拡大して表示</span>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-5xl"
                style={dialogLeft != null ? { left: dialogLeft } : undefined}
              >
                {/* 見た目上のタイトルは不要という要望だが、DialogTitle が無いと
                    aria-labelledby が付かずダイアログの目的が伝わらないため、
                    視覚的に隠したまま残す。 */}
                <DialogTitle className="sr-only">
                  {item.title} の実装コード
                </DialogTitle>
                <JavaCodeBlock
                  code={entry.javaCode}
                  className="max-h-[65vh]"
                />
              </DialogContent>
            </Dialog>
          </div>
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
