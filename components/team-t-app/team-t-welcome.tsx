"use client"

import {
  Gamepad2Icon,
  MaximizeIcon,
  SearchIcon,
  ShapesIcon,
  StarIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { catalogStats, type ApiCatalogItem } from "@/lib/team-t-app/catalog"

const startingPoints = [
  {
    icon: SearchIcon,
    title: "気になる言葉で検索",
  },
  {
    icon: ShapesIcon,
    title: "カテゴリから眺める",
  },
  {
    icon: Gamepad2Icon,
    title: "触った分だけ楽しみが増える",
  },
]

interface TeamTWelcomeProps {
  firstRecommendation?: ApiCatalogItem
  onSelect: (id: string) => void
}

export function TeamTWelcome({
  firstRecommendation,
  onSelect,
}: TeamTWelcomeProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-5xl flex-col justify-center px-4 py-10 md:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-[color:var(--team-t-gold-strong)] uppercase">
          Team T API Lab
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
          {catalogStats.pageCount}個のAPIから、次に作りたいものを見つけよう。
        </h1>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {startingPoints.map((item) => (
          <Card
            key={item.title}
            size="sm"
            className="border-[color:var(--team-t-gold-line)] bg-card"
          >
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-[color:var(--team-t-gold-on-primary)] shadow-[0_0_14px_rgba(139,92,246,0.3)]">
                <item.icon className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            // Fullscreen APIはユーザー操作起点でのみ許可されるため、このボタンが入口。
            if (document.fullscreenElement) return
            document.documentElement.requestFullscreen().catch(() => {})
          }}
          className="border border-[color:var(--team-t-gold-line)] bg-primary text-white shadow-[0_0_0_1px_rgba(183,156,255,0.12),0_0_24px_rgba(139,92,246,0.4)] hover:bg-primary/85"
        >
          <MaximizeIcon data-icon="inline-start" />
          全画面で開始
        </Button>
        {firstRecommendation ? (
          <Button
            variant="outline"
            onClick={() => onSelect(firstRecommendation.id)}
            className="border-[color:var(--team-t-gold-line)] text-[color:var(--team-t-gold-strong)] hover:bg-primary/25 hover:text-[color:var(--team-t-gold-strong)]"
          >
            <StarIcon data-icon="inline-start" />
            おすすめの「{firstRecommendation.title}」を試す
          </Button>
        ) : null}
      </div>
      <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-[color:var(--team-t-gold-line)] pt-6 text-sm">
        <div className="flex items-baseline gap-2">
          <dt className="text-muted-foreground">紹介ページ</dt>
          <dd className="font-semibold tabular-nums text-[color:var(--team-t-gold-strong)]">
            {catalogStats.pageCount}
          </dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="text-muted-foreground">総API数</dt>
          <dd className="font-semibold tabular-nums text-[color:var(--team-t-gold-strong)]">
            {catalogStats.apiCount}
          </dd>
        </div>
      </dl>
    </section>
  )
}
