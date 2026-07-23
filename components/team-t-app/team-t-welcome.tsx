"use client"

import * as React from "react"
import {
  ArrowRightIcon,
  BookOpenIcon,
  MaximizeIcon,
  MinimizeIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { CategoryIcon } from "./category-icon"

const categoryNodes = [
  {
    id: "visual",
    label: "画像・ビジュアル系",
    description:
      "画像、3Dモデル、アバターなど、見た目に楽しい表現をつくるAPI。",
    tags: ["3D・アバター", "動物画像", "画像生成"],
    position: { left: "50%", top: "15%" },
    panelClassName: "top-full left-1/2 mt-4 -translate-x-1/2",
  },
  {
    id: "tools",
    label: "為替・ツール系",
    description:
      "為替レート、天気、変換・計算など、日常や業務に役立つツール系API。",
    tags: ["為替レート", "天気予報", "日付・時刻"],
    position: { left: "83.29%", top: "39.18%" },
    panelClassName: "top-1/2 right-full mr-4 -translate-y-[15%]",
  },
  {
    id: "other",
    label: "その他",
    description:
      "複数の分野を横断するAPIや、ひとつの分類に収まらない発見の入口。",
    tags: ["複数API", "横断検索", "新着"],
    position: { left: "70.57%", top: "78.32%" },
    panelClassName: "right-full top-full mt-4 mr-5",
  },
  {
    id: "entertainment",
    label: "エンタメ・おもしろ系",
    description:
      "クイズ、ゲーム、ジョークや雑学など、体験を楽しくするAPI。",
    tags: ["クイズ・ゲーム", "ジョーク・雑学", "名言"],
    position: { left: "29.43%", top: "78.32%" },
    panelClassName: "top-full left-full mt-4 ml-5",
  },
  {
    id: "data",
    label: "データ・検索系",
    description:
      "検索、知識、位置情報など、必要なデータへすばやくたどり着くAPI。",
    tags: ["データ検索", "地図・位置情報", "オープンデータ"],
    position: { left: "16.71%", top: "39.18%" },
    panelClassName: "top-1/2 left-full ml-4 -translate-y-[15%]",
  },
] as const

type CategoryNode = (typeof categoryNodes)[number]
type CategoryNodeId = CategoryNode["id"]

interface TeamTWelcomeProps {
  onCategoryExplore: (category: string) => void
  onIntroOpen: () => void
}

function TeamTWelcomeBackground() {
  return (
    <div
      data-team-t-welcome-background
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 42% 48% at 78% 28%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 72%), radial-gradient(ellipse 34% 42% at 18% 84%, color-mix(in oklab, var(--team-t-gold) 9%, transparent), transparent 74%), linear-gradient(135deg, color-mix(in oklab, var(--background) 96%, var(--primary)) 0%, var(--background) 56%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "4.5rem 4.5rem",
        }}
      />
      <div
        className="absolute top-[12%] right-[3%] h-[62%] w-[42%] opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 48%, transparent) 0 1px, transparent 1.5px)",
          backgroundSize: "1.35rem 1.35rem",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, rgba(0,0,0,.72) 36%, transparent 74%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, rgba(0,0,0,.72) 36%, transparent 74%)",
        }}
      />
      <div className="absolute -top-[5rem] -right-[11rem] h-[29rem] w-[42rem] -rotate-12 rounded-[50%] border border-primary/20" />
      <div className="absolute -top-[1rem] -right-[8rem] h-[22rem] w-[34rem] -rotate-12 rounded-[50%] border border-foreground/10" />
      <div className="absolute -bottom-[7rem] -left-[12rem] h-[23rem] w-[38rem] rotate-12 rounded-[50%] border border-primary/20" />
      <div className="absolute -bottom-[2rem] -left-[9rem] h-[17rem] w-[30rem] rotate-12 rounded-[50%] border border-foreground/10" />
    </div>
  )
}

function CategoryDetail({
  category,
  onExplore,
  className,
}: {
  category: CategoryNode
  onExplore: (category: string) => void
  className?: string
}) {
  return (
    <div
      role="region"
      aria-label={`${category.label}の説明`}
      className={cn(
        "w-60 rounded-2xl border border-[color:var(--team-t-gold-line)] bg-card/95 p-4 text-left text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.32),0_0_28px_color-mix(in_oklab,var(--primary)_18%,transparent)] backdrop-blur-md",
        className
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <p className="text-sm font-semibold">{category.label}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {category.description}
      </p>
      <p className="mt-3 text-xs font-medium text-muted-foreground">注目API</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {category.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-[11px] text-foreground/80"
          >
            {tag}
          </span>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-9 w-full border-[color:var(--team-t-gold)] bg-[color:var(--team-t-gold)]/5 text-xs text-[color:var(--team-t-gold-strong)] hover:bg-primary/20 hover:text-foreground"
        onClick={() => onExplore(category.label)}
      >
        このジャンルを探索
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

function CategoryNodeButton({
  category,
  selected,
  onSelect,
}: {
  category: CategoryNode
  selected: boolean
  onSelect: (id: CategoryNodeId) => void
}) {
  return (
    <button
      type="button"
      aria-label={`${category.label}を選択`}
      aria-pressed={selected}
      className={cn(
        "group relative grid size-16 place-items-center rounded-full border bg-card/92 text-primary outline-none transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/65 hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-[color:var(--team-t-gold)] bg-primary/18 text-[color:var(--team-t-gold-strong)] shadow-[0_0_0_5px_color-mix(in_oklab,var(--team-t-gold)_12%,transparent),0_0_34px_color-mix(in_oklab,var(--team-t-gold)_48%,transparent)]"
          : "border-primary/50 text-[color:var(--ring)] shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_0_20px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
      )}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(category.id)
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-2 rounded-full border transition-colors",
          selected
            ? "border-[color:var(--team-t-gold-line)]"
            : "border-primary/20"
        )}
      />
      <CategoryIcon category={category.label} className="relative size-6" />
    </button>
  )
}

function CompactCategoryButton({
  category,
  selected,
  onSelect,
}: {
  category: CategoryNode
  selected: boolean
  onSelect: (id: CategoryNodeId) => void
}) {
  return (
    <button
      type="button"
      aria-label={`${category.label}を選択`}
      aria-pressed={selected}
      className={cn(
        "group flex min-h-16 w-full items-center gap-3 rounded-xl border bg-card/88 px-3 py-2.5 text-left outline-none transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/65 hover:bg-primary/12 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-[color:var(--team-t-gold)] bg-primary/18 shadow-[0_0_0_3px_color-mix(in_oklab,var(--team-t-gold)_10%,transparent),0_10px_26px_rgba(0,0,0,0.2)]"
          : "border-primary/35 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
      )}
      onClick={() => onSelect(category.id)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg border bg-primary/10 text-[color:var(--ring)]",
          selected
            ? "border-[color:var(--team-t-gold-line)] text-[color:var(--team-t-gold-strong)]"
            : "border-primary/25"
        )}
      >
        <CategoryIcon category={category.label} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm leading-5 font-semibold text-foreground">
          {category.label}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {category.tags.slice(0, 2).join(" / ")}
        </span>
      </span>
    </button>
  )
}

function DesktopCategoryAtlas({
  selectedId,
  onExplore,
  onSelect,
  onDismiss,
}: {
  selectedId: CategoryNodeId | null
  onExplore: (category: string) => void
  onSelect: (id: CategoryNodeId) => void
  onDismiss: () => void
}) {
  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest("[data-team-t-category-trigger]")) return
      onDismiss()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [onDismiss])

  return (
    <div
      data-team-t-category-atlas
      data-team-t-desktop-category-atlas
      role="group"
      aria-label="APIジャンルマップ"
      className="relative h-[clamp(24rem,54vh,32rem)] min-h-0"
      onClick={onDismiss}
    >
      <div
        aria-hidden="true"
        className="absolute top-[56%] left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-[color:var(--team-t-gold)]/60 shadow-[0_0_32px_color-mix(in_oklab,var(--team-t-gold)_10%,transparent)]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        preserveAspectRatio="none"
      >
        {categoryNodes.map((category) => (
          <line
            key={category.id}
            x1="50%"
            y1="56%"
            x2={category.position.left}
            y2={category.position.top}
            stroke="color-mix(in oklab, var(--team-t-gold) 28%, transparent)"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div
        aria-hidden="true"
        className="absolute top-[56%] left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--team-t-gold-line)] bg-background/75 text-[color:var(--team-t-gold)] shadow-[0_0_34px_color-mix(in_oklab,var(--team-t-gold)_18%,transparent)] backdrop-blur-sm"
      >
        <SparklesIcon className="size-6" />
      </div>

      {categoryNodes.map((category) => {
        const selected = selectedId === category.id
        return (
          <div
            key={category.id}
            data-team-t-category-trigger
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2",
              selected && "z-30"
            )}
            style={category.position}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-foreground">
              {category.label}
            </span>
            <CategoryNodeButton
              category={category}
              selected={selected}
              onSelect={onSelect}
            />
            {selected ? (
              <div className={cn("absolute z-40", category.panelClassName)}>
                <CategoryDetail category={category} onExplore={onExplore} />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function CompactCategoryAtlas({
  selectedId,
  onExplore,
  onSelect,
}: {
  selectedId: CategoryNodeId | null
  onExplore: (category: string) => void
  onSelect: (id: CategoryNodeId) => void
}) {
  const selectedCategory = categoryNodes.find(
    (category) => category.id === selectedId
  )

  return (
    <div
      data-team-t-compact-category-atlas
      className="mt-8"
      role="group"
      aria-label="APIジャンルマップ"
    >
      <div className="grid grid-cols-2 gap-3">
        {categoryNodes.map((category, index) => {
          const selected = selectedId === category.id
          return (
            <div
              key={category.id}
              className={cn(index === categoryNodes.length - 1 && "col-span-2")}
            >
              <CompactCategoryButton
                category={category}
                selected={selected}
                onSelect={onSelect}
              />
            </div>
          )
        })}
      </div>
      {selectedCategory ? (
        <div className="mt-4 flex justify-center">
          <CategoryDetail
            category={selectedCategory}
            onExplore={onExplore}
            className="w-full max-w-xl"
          />
        </div>
      ) : null}
    </div>
  )
}

export function TeamTWelcome({
  onCategoryExplore,
  onIntroOpen,
}: TeamTWelcomeProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<CategoryNodeId | null>(null)

  React.useEffect(() => {
    const syncFullscreen = () =>
      setIsFullscreen(Boolean(document.fullscreenElement))

    syncFullscreen()
    document.addEventListener("fullscreenchange", syncFullscreen)
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen)
  }, [])

  React.useEffect(() => {
    const clearSelection = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCategoryId(null)
    }

    document.addEventListener("keydown", clearSelection)
    return () => document.removeEventListener("keydown", clearSelection)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      return
    }
    document.documentElement.requestFullscreen().catch(() => {})
  }

  const toggleCategory = (id: CategoryNodeId) => {
    setSelectedCategoryId((current) => (current === id ? null : id))
  }

  const exploreCategory = (category: string) => {
    setSelectedCategoryId(null)
    onCategoryExplore(category)
  }

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-3.5rem)] w-full overflow-hidden"
      style={{ containerType: "inline-size" }}
    >
      <style>{`
        [data-team-t-desktop-category-atlas] { display: none; }
        [data-team-t-compact-category-atlas] { display: block; }
        @container (min-width: 52rem) {
          [data-team-t-desktop-category-atlas] { display: block; }
          [data-team-t-compact-category-atlas] { display: none; }
        }
      `}</style>
      <TeamTWelcomeBackground />
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-10 pb-6 md:px-8 md:pt-12">
        <div className="w-full max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-[color:var(--team-t-gold-strong)] uppercase">
            Team T API Lab
          </p>
          <h1 className="mt-3 text-[clamp(2rem,3.3vw,2.75rem)] font-semibold tracking-tight text-balance text-foreground lg:whitespace-nowrap">
            ひらめきの入口を、見つけよう。
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            APIの世界を地図のように探索して、新しい発見を。
          </p>
        </div>

        <DesktopCategoryAtlas
          selectedId={selectedCategoryId}
          onExplore={exploreCategory}
          onSelect={toggleCategory}
          onDismiss={() => setSelectedCategoryId(null)}
        />
        <CompactCategoryAtlas
          selectedId={selectedCategoryId}
          onExplore={exploreCategory}
          onSelect={toggleCategory}
        />

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-5 pb-7 md:pb-8">
          <Button
            variant="outline"
            onClick={toggleFullscreen}
            className="h-[3.025rem] -translate-y-0.5 border-primary/55 bg-background/50 px-[1.375rem] text-[1.1rem] text-foreground shadow-none backdrop-blur-sm hover:bg-primary/15 [&_svg]:size-[1.375rem]"
          >
            {isFullscreen ? (
              <MinimizeIcon data-icon="inline-start" />
            ) : (
              <MaximizeIcon data-icon="inline-start" />
            )}
            {isFullscreen ? "全画面を解除" : "全画面で開始"}
          </Button>
          <Button
            variant="ghost"
            onClick={onIntroOpen}
            className="h-[3.025rem] -translate-y-0.5 px-[1.375rem] text-[1.1rem] text-[color:var(--team-t-gold-strong)] hover:bg-primary/15 hover:text-foreground [&_svg]:size-[1.375rem]"
          >
            <BookOpenIcon data-icon="inline-start" />
            このアプリの紹介を見る
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
