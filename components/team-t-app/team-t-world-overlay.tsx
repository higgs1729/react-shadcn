"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  ChevronLeftIcon,
  DoorOpenIcon,
  GaugeIcon,
  PlayIcon,
  RotateCcwIcon,
  TrophyIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { getTeamTGamePreviewUrl } from "@/lib/team-t-app/games"
import type { TeamTPreferences } from "@/lib/team-t-app/preferences"
import { teamTWorldKiosks, type TeamTWorldKiosk } from "@/lib/team-t-app/world"

import { TeamTCoinBalance } from "./team-t-coin-balance"
import { TeamTGameRuntime, type TeamTGameResult } from "./team-t-game-runtime"

// three / r3f / drei を初期バンドルから外し、ワールドを開いたときだけ読み込む。
const TeamTWorldCanvas = dynamic(
  () => import("./team-t-world-canvas").then((mod) => mod.TeamTWorldCanvas),
  { ssr: false, loading: () => <WorldLoading /> }
)

type WorldMode = "exploring" | "briefing" | "playing" | "result"
type FallbackReason = "mobile" | "webgl" | "glb" | null

function detectWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

/** Canvas 配下(WebGL / GLB)の失敗を捕まえてフォールバックへ倒す。 */
class CanvasErrorBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function WorldLoading() {
  return (
    <div className="grid h-full w-full place-items-center bg-[#05030a] text-sm text-[#b9b2a7]">
      <div className="flex flex-col items-center gap-3">
        <span className="size-8 animate-spin rounded-full border-2 border-[#9b6cff]/40 border-t-[#9b6cff]" />
        APIアーケードを開店準備中…
      </div>
    </div>
  )
}

interface TeamTWorldOverlayProps {
  open: boolean
  coinCount: number
  preferences: TeamTPreferences
  onOpenChange: (open: boolean) => void
  onSpend: (cost: number) => boolean
  onRefund: (cost: number) => void
  onAward: (coins: number) => void
}

export function TeamTWorldOverlay({
  open,
  coinCount,
  preferences,
  onOpenChange,
  onSpend,
  onRefund,
  onAward,
}: TeamTWorldOverlayProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = React.useState(false)
  const [mode, setMode] = React.useState<WorldMode>("exploring")
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [exitActive, setExitActive] = React.useState(false)
  const [failure, setFailure] =
    React.useState<Exclude<FallbackReason, "mobile">>(null)
  const [result, setResult] = React.useState<TeamTGameResult | null>(null)

  React.useEffect(() => setMounted(true), [])

  // WebGL が無い環境は Canvas を積む前にフォールバックへ倒す。
  React.useEffect(() => {
    if (open && !isMobile && failure === null && !detectWebgl()) {
      setFailure("webgl")
    }
  }, [open, isMobile, failure])

  // 閉じたら状態を初期化する。
  React.useEffect(() => {
    if (!open) {
      setMode("exploring")
      setSelectedIndex(null)
      setActiveIndex(null)
      setExitActive(false)
      setResult(null)
    }
  }, [open])

  if (!open || !mounted) return null

  const useFallback = isMobile || failure !== null
  const reduceMotion = preferences.reduceMotion
  const selectedKiosk =
    selectedIndex != null
      ? (teamTWorldKiosks.find((kiosk) => kiosk.index === selectedIndex) ??
        null)
      : null

  const openBriefing = (index: number) => {
    setSelectedIndex(index)
    setResult(null)
    setMode("briefing")
  }

  const backToExploring = () => {
    setSelectedIndex(null)
    setResult(null)
    setMode("exploring")
  }

  const startPlaying = () => {
    if (!selectedKiosk) return
    if (!onSpend(selectedKiosk.game.cost)) return
    setResult(null)
    setMode("playing")
  }

  const handleSettle = (next: TeamTGameResult) => {
    setResult(next)
    setMode("result")
  }

  const overlay = (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#05030a] text-[#f7f1e7]">
      {/* HUD 上段 */}
      <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[#b99a5c]/30 bg-black/40 px-4 backdrop-blur-sm sm:px-6">
        <span className="text-sm font-semibold tracking-[0.2em] text-[#d8bf88] uppercase">
          API Arcade
        </span>
        <TeamTCoinBalance coins={coinCount} className="ml-auto text-base" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="APIアーケードを出る"
          className="border-[#d8bf88]/60 bg-[#1a1028]/90 text-[#f7f1e7] shadow-[0_0_16px_rgba(155,108,255,0.18)] hover:border-[#ffe6a8] hover:bg-[#312047]"
          onClick={() => onOpenChange(false)}
        >
          <DoorOpenIcon data-icon="inline-start" />
          アーケードを出る
        </Button>
      </header>

      {/* 本体 */}
      <div className="relative min-h-0 flex-1">
        {useFallback ? (
          <FallbackList onSelect={openBriefing} />
        ) : (
          <CanvasErrorBoundary onError={() => setFailure("glb")}>
            <TeamTWorldCanvas
              reduceMotion={reduceMotion}
              controlsEnabled={mode === "exploring"}
              paused={mode === "playing" || mode === "result"}
              onActiveKioskChange={setActiveIndex}
              onExitActiveChange={setExitActive}
              onInteract={openBriefing}
              onExit={() => onOpenChange(false)}
            />
          </CanvasErrorBoundary>
        )}

        {/* 操作ヒント(3D・探索中のみ) */}
        {!useFallback && mode === "exploring" ? (
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#b99a5c]/30 bg-black/55 px-5 py-2 text-xs text-[#d8cfc0] backdrop-blur-sm">
            <span>WASD / 矢印で移動</span>
            <span className="text-[#b99a5c]">·</span>
            <span className={activeIndex != null ? "text-[#ffe6a8]" : ""}>
              {exitActive
                ? "E でアーケードを出る"
                : activeIndex != null
                  ? "▸ E で起動"
                  : "筐体に近づいて起動"}
            </span>
          </div>
        ) : null}

        {/* ブリーフィング */}
        {mode === "briefing" && selectedKiosk ? (
          <BriefingPanel
            kiosk={selectedKiosk}
            coinCount={coinCount}
            onBack={backToExploring}
            onStart={startPlaying}
          />
        ) : null}

        {/* プレイ中 */}
        {mode === "playing" && selectedKiosk ? (
          <div className="absolute inset-0 z-40 bg-black">
            <TeamTGameRuntime
              game={selectedKiosk.game}
              onRefund={onRefund}
              onAward={onAward}
              onSettle={handleSettle}
              onBack={backToExploring}
            />
          </div>
        ) : null}

        {mode === "result" && selectedKiosk && result ? (
          <ResultPanel
            kiosk={selectedKiosk}
            result={result}
            coinCount={coinCount}
            onContinue={backToExploring}
            onReplay={startPlaying}
            onExit={() => onOpenChange(false)}
          />
        ) : null}
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}

function BriefingPanel({
  kiosk,
  coinCount,
  onBack,
  onStart,
}: {
  kiosk: TeamTWorldKiosk
  coinCount: number
  onBack: () => void
  onStart: () => void
}) {
  const { game } = kiosk
  const canPlay = coinCount >= game.cost

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#c7ab70]/60 bg-[#0b0710]/95 shadow-[0_0_0_1px_rgba(183,156,255,0.14),0_0_46px_rgba(139,92,246,0.4)]">
        <div className="aspect-video w-full overflow-hidden border-b border-[#9b8050]/45 bg-black">
          <Image
            src={getTeamTGamePreviewUrl(game)}
            alt={`${game.title} のプレビュー`}
            width={1280}
            height={720}
            unoptimized
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="text-2xl font-semibold tracking-wide text-[#f4e8d1]">
            {game.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#b9b2a7]">
            {game.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-[#aaa59b]">
            <span className="inline-flex items-center gap-1">
              <GaugeIcon className="size-3.5" /> {game.difficulty}
            </span>
            <TeamTCoinBalance
              coins={game.cost}
              prefix="-"
              label={false}
              className="text-xs"
            />
            <TeamTCoinBalance
              coins={game.maxReward}
              prefix="+"
              label={false}
              className="text-xs"
            />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-[#b8a8cc]/55 bg-white/[0.06] text-sm font-semibold text-[#f4e8d1] hover:border-[#d8bf88] hover:bg-white/10"
              onClick={onBack}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              探索へ戻る
            </Button>
            <Button
              type="button"
              disabled={!canPlay}
              onClick={onStart}
              className="h-12 rounded-xl border border-[#c7ab70] bg-[#4c2378] text-lg font-semibold text-white shadow-[0_0_0_2px_rgba(183,156,255,0.12),0_0_26px_rgba(139,92,246,0.5)] hover:bg-[#613392] [&_svg]:size-5"
            >
              <PlayIcon data-icon="inline-start" />
              プレイ
            </Button>
          </div>
          {!canPlay ? (
            <p className="mt-2 text-right text-xs text-[#d8a0a0]">
              コインが足りません(必要 {game.cost})
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ResultPanel({
  kiosk,
  result,
  coinCount,
  onContinue,
  onReplay,
  onExit,
}: {
  kiosk: TeamTWorldKiosk
  result: TeamTGameResult
  coinCount: number
  onContinue: () => void
  onReplay: () => void
  onExit: () => void
}) {
  const cleared = result.status === "cleared"
  const loadError = result.status === "load-error"
  const canReplay = coinCount >= kiosk.game.cost

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#05030a]/78 p-4 backdrop-blur-md">
      <section className="w-full max-w-md animate-in rounded-3xl border border-[#c7ab70]/65 bg-[#10091a]/96 p-6 text-center shadow-[0_0_0_1px_rgba(155,108,255,0.18),0_0_60px_rgba(155,108,255,0.38)] duration-300 zoom-in-95 fade-in sm:p-8">
        <div
          className={`mx-auto grid size-16 place-items-center rounded-full border ${cleared ? "border-[#ffe6a8] bg-[#d8bf88]/15 text-[#ffe6a8]" : "border-[#9b6cff]/70 bg-[#9b6cff]/12 text-[#c8b4ff]"}`}
        >
          {cleared ? (
            <TrophyIcon className="size-8" />
          ) : (
            <RotateCcwIcon className="size-7" />
          )}
        </div>
        <p className="mt-5 text-xs font-semibold tracking-[0.28em] text-[#b9a6d1] uppercase">
          {kiosk.game.title}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-wide text-[#f7f1e7]">
          {cleared ? "GAME CLEAR" : loadError ? "LOAD ERROR" : "GAME OVER"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#b9b2a7]">
          {cleared
            ? `${result.coins}コインを獲得しました。`
            : loadError
              ? `読み込みに失敗しました。${kiosk.game.cost}コインは返却済みです。`
              : "今回は報酬なし。もう一度挑戦できます。"}
        </p>
        <div className="mt-7 grid gap-3">
          <Button
            type="button"
            onClick={onContinue}
            className="h-12 rounded-xl border border-[#d8bf88] bg-[#4c2378] text-base font-bold text-white shadow-[0_0_24px_rgba(155,108,255,0.4)] hover:bg-[#613392]"
          >
            <ChevronLeftIcon data-icon="inline-start" />
            アーケードへ戻る
          </Button>
          {!loadError ? (
            <Button
              type="button"
              variant="outline"
              disabled={!canReplay}
              onClick={onReplay}
              className="h-11 rounded-xl border-[#b8a8cc]/50 bg-white/[0.05] text-[#f4e8d1] hover:bg-white/10"
            >
              <RotateCcwIcon data-icon="inline-start" />
              もう一度プレイ（{kiosk.game.cost}コイン）
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-[#aaa1b5] hover:bg-white/[0.06] hover:text-white"
          >
            <DoorOpenIcon data-icon="inline-start" />
            アーケードを出る
          </Button>
        </div>
      </section>
    </div>
  )
}

/**
 * フォールバック一覧。モバイル幅・WebGL不可・GLB読込失敗のときに 3D の代わりに出す。
 * 選択→ブリーフィング→プレイの導線は 3D と共通。
 */
function FallbackList({ onSelect }: { onSelect: (index: number) => void }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#05030a] p-4 sm:p-6">
      <p className="mx-auto mb-4 max-w-4xl text-sm text-[#b9b2a7]">
        この環境では3Dワールドの代わりに一覧から選びます。
      </p>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamTWorldKiosks.map((kiosk) => (
          <article
            key={kiosk.index}
            className="group relative overflow-hidden rounded-xl border border-[#9b8050]/55 bg-[#08090b]/95 text-left shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-[border-color,box-shadow] hover:border-[#c2a66e]/80"
          >
            <div className="aspect-video overflow-hidden border-b border-[#9b8050]/45 bg-black">
              <Image
                src={getTeamTGamePreviewUrl(kiosk.game)}
                alt={`${kiosk.game.title} のプレビュー`}
                width={1280}
                height={720}
                unoptimized
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="p-3.5">
              <h2 className="font-medium text-[#f7f1e7]">{kiosk.game.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-[#aaa59b]">
                {kiosk.game.description}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-[#aaa59b]">
                <span className="inline-flex items-center gap-1">
                  <GaugeIcon className="size-3" /> {kiosk.game.difficulty}
                </span>
                <TeamTCoinBalance
                  coins={kiosk.game.maxReward}
                  prefix="+"
                  label={false}
                  className="gap-1 text-xs"
                />
              </div>
            </div>
            <button
              type="button"
              className="absolute inset-0 z-10 rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${kiosk.game.title}を選択`}
              onClick={() => onSelect(kiosk.index)}
            />
          </article>
        ))}
      </div>
    </div>
  )
}
