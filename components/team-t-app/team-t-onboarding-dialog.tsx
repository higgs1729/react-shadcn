"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CoinsIcon,
  CompassIcon,
  Gamepad2Icon,
  MaximizeIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { TeamTCoinImage } from "./team-t-coin-balance"

const tutorialSteps = [
  {
    id: "discover",
    kicker: "WELCOME TO TEAM T API LAB",
    title: "触って、次のアイデアを見つける",
    description:
      "さまざまなWeb APIを実際に試しながら、作りたいものの入口を見つけるためのラボです。",
    points: [
      "気になるAPIを選ぶと、専用のプレビューが開きます。",
      "最初は正解を決めず、地図を眺める感覚で探索できます。",
    ],
  },
  {
    id: "navigate",
    kicker: "FIND YOUR API",
    title: "探し方は、2つ",
    description:
      "名前や用途が決まっているときはサイドバーから。まだ曖昧なときは、探索画面の5ジャンルから始められます。",
    points: [
      "検索欄の×を押すと、いつでも全件表示へ戻せます。",
      "サイドバーの幅は、境界をドラッグして調整できます。",
    ],
  },
  {
    id: "play",
    kicker: "EXPLORE & EARN",
    title: "試した分だけ、楽しみが増える",
    description:
      "APIを試すとコインが貯まり、APIアーケードの3Dマップやミニゲームを楽しめます。",
    points: [
      "「探索を始める」を押すと、見やすい全画面表示へ切り替わります。",
      "全画面はEscキー、または探索画面下部のボタンで解除できます。",
    ],
  },
] as const

const tutorialAtlasNodes = [
  { id: "visual", x: 50, y: 15 },
  { id: "tools", x: 83.29, y: 39.18 },
  { id: "other", x: 70.57, y: 78.32 },
  { id: "entertainment", x: 29.43, y: 78.32 },
  { id: "data", x: 16.71, y: 39.18 },
] as const

interface TeamTOnboardingDialogProps {
  open: boolean
  firstRun: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  onSkip: () => void
}

export function TeamTOnboardingDialog({
  open,
  firstRun,
  onOpenChange,
  onComplete,
  onSkip,
}: TeamTOnboardingDialogProps) {
  const primaryActionRef = React.useRef<HTMLButtonElement>(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [skipDialogOpen, setSkipDialogOpen] = React.useState(false)
  const step = tutorialSteps[stepIndex]
  const isLastStep = stepIndex === tutorialSteps.length - 1

  React.useEffect(() => {
    if (!open) return
    setStepIndex(0)
    setSkipDialogOpen(false)
  }, [open])

  return (
    <>
      <Dialog
        open={open}
        disablePointerDismissal={firstRun}
        onOpenChange={(nextOpen) => {
          if (firstRun && !nextOpen) return
          onOpenChange(nextOpen)
        }}
      >
        <DialogContent
          showCloseButton={!firstRun}
          initialFocus={primaryActionRef}
          className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        >
        <div className="border-b border-border/70 px-5 py-4 sm:px-6">
          <DialogHeader className="gap-1 pr-10">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-base font-semibold">
                Team T API Lab チュートリアル
              </DialogTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                {stepIndex + 1} / {tutorialSteps.length}
              </span>
            </div>
            <DialogDescription>
              API探索の基本を3ステップで紹介します。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
            {tutorialSteps.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  "h-1 rounded-full transition-colors",
                  index <= stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <div className="grid min-h-80 md:grid-cols-[0.9fr_1.1fr]">
          <TutorialVisual stepIndex={stepIndex} />
          <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              {step.kicker}
            </p>
            <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
              {step.title}
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {step.description}
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-6">
              {step.points.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <SparklesIcon
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-[color:var(--team-t-gold-strong)]"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
          <div className="order-2 min-h-8 sm:order-1">
            {firstRun ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setSkipDialogOpen(true)}
              >
                今はスキップ
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                閉じる
              </Button>
            )}
          </div>

          <div className="order-1 flex justify-end gap-2 sm:order-2">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStepIndex((current) => current - 1)}
              >
                <ArrowLeftIcon data-icon="inline-start" />
                戻る
              </Button>
            ) : null}
            {isLastStep ? (
              <Button
                ref={primaryActionRef}
                type="button"
                onClick={onComplete}
              >
                <MaximizeIcon data-icon="inline-start" />
                探索を始める
              </Button>
            ) : (
              <Button
                ref={primaryActionRef}
                type="button"
                onClick={() => setStepIndex((current) => current + 1)}
              >
                次へ
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              チュートリアルをスキップしますか？
            </AlertDialogTitle>
            <AlertDialogDescription>
              スキップしても、あとから「設定 → 使い方」の「チュートリアルを見る」でいつでも確認できます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="default">
              チュートリアルに戻る
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={() => {
                setSkipDialogOpen(false)
                onSkip()
              }}
            >
              スキップする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TutorialVisual({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="relative min-h-56 overflow-hidden border-b border-border/70 bg-[radial-gradient(circle_at_72%_24%,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_42%),linear-gradient(145deg,color-mix(in_oklab,var(--background)_92%,var(--primary)),var(--background))] md:min-h-0 md:border-r md:border-b-0">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:2.75rem_2.75rem]"
      />
      {stepIndex === 0 ? <DiscoveryVisual /> : null}
      {stepIndex === 1 ? <NavigationVisual /> : null}
      {stepIndex === 2 ? <RewardVisual /> : null}
    </div>
  )
}

function DiscoveryVisual() {
  return (
    <div className="absolute inset-5 grid place-items-center">
      <TutorialMiniAtlas />
    </div>
  )
}

function NavigationVisual() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-6 flex overflow-hidden rounded-xl border border-border/80 bg-background/85 shadow-2xl backdrop-blur-sm"
    >
      <div className="w-[44%] border-r border-border/70 p-3">
        <div className="flex h-8 items-center gap-2 rounded-md border bg-background px-2 text-muted-foreground">
          <SearchIcon className="size-3.5" />
          <span className="h-1.5 w-16 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="mt-4 space-y-2.5">
          {["w-[82%]", "w-[68%]", "w-[76%]", "w-[56%]"].map((width) => (
            <div key={width} className="flex items-center gap-2">
              <span className="size-3 rounded-sm border border-primary/45" />
              <span className={cn("h-1.5 rounded-full bg-foreground/25", width)} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-w-0 flex-1 place-items-center px-2">
        <TutorialMiniAtlas compact />
      </div>
    </div>
  )
}

function TutorialMiniAtlas({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      data-team-t-tutorial-atlas
      className={cn(
        "relative aspect-[1.6] w-[92%]",
        compact ? "max-w-40" : "max-w-80"
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="50"
          cy="50"
          rx="35"
          ry="35"
          fill="none"
          stroke="color-mix(in oklab, var(--team-t-gold) 55%, transparent)"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
        {tutorialAtlasNodes.map((node) => (
          <line
            key={node.id}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="color-mix(in oklab, var(--team-t-gold) 24%, transparent)"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <span
        className={cn(
          "absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--team-t-gold-line)] bg-background/90 text-[color:var(--team-t-gold-strong)] shadow-lg",
          compact ? "size-9" : "size-14"
        )}
      >
        <CompassIcon className={compact ? "size-4" : "size-6"} />
      </span>

      {tutorialAtlasNodes.map((node) => (
        <span
          key={node.id}
          className={cn(
            "absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/45 bg-background/95 text-primary shadow-md",
            compact ? "size-3.5" : "size-8"
          )}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <span
            className={cn(
              "rounded-full bg-current",
              compact ? "size-1" : "size-1.5"
            )}
          />
        </span>
      ))}
    </div>
  )
}

function RewardVisual() {
  return (
    <div className="absolute inset-6 grid place-items-center" aria-hidden="true">
      <div className="w-full max-w-64 rounded-2xl border border-[color:var(--team-t-gold-line)] bg-background/88 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-xl border border-[color:var(--team-t-gold-line)] bg-[color:var(--team-t-gold)]/10">
            <TeamTCoinImage className="size-11 object-contain" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">APIを試して獲得</p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold">
              <CoinsIcon className="size-4 text-[color:var(--team-t-gold-strong)]" />
              Reward coin
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/15 p-3 text-primary">
          <Gamepad2Icon className="size-5" />
          <span className="text-sm font-semibold">APIアーケードへ</span>
          <MaximizeIcon className="ml-auto size-4" />
        </div>
      </div>
    </div>
  )
}
