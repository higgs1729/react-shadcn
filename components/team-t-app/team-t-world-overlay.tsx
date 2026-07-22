"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  CircleHelpIcon,
  CoinsIcon,
  DoorOpenIcon,
  GaugeIcon,
  Gamepad2Icon,
  PaletteIcon,
  PlayIcon,
  RotateCcwIcon,
  ShirtIcon,
  SparklesIcon,
  TrophyIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { getTeamTGamePreviewUrl } from "@/lib/team-t-app/games"
import {
  defaultTeamTArcadeWorldSettings,
  readTeamTArcadeWorldSettings,
  type TeamTPreferences,
  type TeamTWorldSkinId,
  writeTeamTArcadeWorldSettings,
} from "@/lib/team-t-app/preferences"
import {
  TEAM_T_WORLD_SKINS,
  teamTWorldKiosks,
  type TeamTWorldKiosk,
} from "@/lib/team-t-app/world"

import { TeamTCoinBalance } from "./team-t-coin-balance"
import { TeamTGameRuntime, type TeamTGameResult } from "./team-t-game-runtime"
import type { TeamTWorldPreviewAnimation } from "./team-t-world-skin-preview"

// three / r3f / drei を初期バンドルから外し、ワールドを開いたときだけ読み込む。
const TeamTWorldCanvas = dynamic(
  () => import("./team-t-world-canvas").then((mod) => mod.TeamTWorldCanvas),
  { ssr: false, loading: () => <WorldLoading /> }
)
const TeamTWorldSkinPreview = dynamic(
  () =>
    import("./team-t-world-skin-preview").then(
      (mod) => mod.TeamTWorldSkinPreview
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#090510] text-xs text-[#aaa1b2]">
        プレビューを準備中…
      </div>
    ),
  }
)

type WorldMode =
  "exploring" | "tutorial" | "skin" | "briefing" | "playing" | "result"
type TutorialReturnMode = Extract<WorldMode, "exploring" | "briefing">
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
  const [failure, setFailure] =
    React.useState<Exclude<FallbackReason, "mobile">>(null)
  const [result, setResult] = React.useState<TeamTGameResult | null>(null)
  const [skinId, setSkinId] = React.useState<TeamTWorldSkinId>(
    defaultTeamTArcadeWorldSettings.skinId
  )
  const [tutorialCompleted, setTutorialCompleted] = React.useState(false)
  const [tutorialStep, setTutorialStep] = React.useState(0)
  const [tutorialIncludesSkin, setTutorialIncludesSkin] = React.useState(true)
  const [tutorialReturnMode, setTutorialReturnMode] =
    React.useState<TutorialReturnMode>("exploring")

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
      setResult(null)
      return
    }

    const settings = readTeamTArcadeWorldSettings(window.localStorage)
    setSkinId(settings.skinId)
    setTutorialCompleted(settings.tutorialCompleted)
    setTutorialStep(0)
    setTutorialIncludesSkin(true)
    setTutorialReturnMode("exploring")
    if (!settings.tutorialCompleted) setMode("tutorial")
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

  const saveWorldSettings = (
    nextSkinId: TeamTWorldSkinId,
    completed: boolean
  ) => {
    writeTeamTArcadeWorldSettings(window.localStorage, {
      skinId: nextSkinId,
      tutorialCompleted: completed,
    })
  }

  const selectSkin = (nextSkinId: TeamTWorldSkinId) => {
    setSkinId(nextSkinId)
    saveWorldSettings(nextSkinId, tutorialCompleted)
  }

  const showTutorial = () => {
    setTutorialReturnMode(mode === "briefing" ? "briefing" : "exploring")
    setTutorialStep(0)
    setTutorialIncludesSkin(false)
    setMode("tutorial")
  }

  const showSkinPicker = () => {
    setTutorialReturnMode(mode === "briefing" ? "briefing" : "exploring")
    setMode("skin")
  }

  const finishTutorial = () => {
    setTutorialCompleted(true)
    saveWorldSettings(skinId, true)
    setMode(tutorialReturnMode)
  }

  const closeTutorial = () => setMode(tutorialReturnMode)

  const overlay = (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#05030a] text-[#f7f1e7]">
      {/* HUD 上段 */}
      <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[#b99a5c]/30 bg-black/40 px-4 backdrop-blur-sm sm:px-6">
        <span className="text-sm font-semibold tracking-[0.2em] text-[#d8bf88] uppercase">
          API Arcade
        </span>
        <TeamTCoinBalance coins={coinCount} className="ml-auto text-base" />
        {mode !== "playing" &&
        mode !== "result" &&
        mode !== "tutorial" &&
        mode !== "skin" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#9b6cff]/55 bg-[#160d25]/80 text-[#eee5ff] hover:border-[#c8b4ff] hover:bg-[#2b1944]"
              onClick={showSkinPicker}
            >
              <ShirtIcon data-icon="inline-start" />
              スキン
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#9b6cff]/55 bg-[#160d25]/80 text-[#eee5ff] hover:border-[#c8b4ff] hover:bg-[#2b1944]"
              onClick={showTutorial}
            >
              <CircleHelpIcon data-icon="inline-start" />
              遊び方
            </Button>
          </>
        ) : null}
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
              onInteract={openBriefing}
              onExit={() => onOpenChange(false)}
              skinId={skinId}
            />
          </CanvasErrorBoundary>
        )}

        {/* ブリーフィング */}
        {mode === "briefing" && selectedKiosk ? (
          <BriefingPanel
            kiosk={selectedKiosk}
            coinCount={coinCount}
            onBack={backToExploring}
            onStart={startPlaying}
          />
        ) : null}

        {mode === "tutorial" ? (
          <TutorialPanel
            step={tutorialStep}
            skinId={skinId}
            reduceMotion={reduceMotion}
            canClose={tutorialCompleted}
            includeSkinStep={tutorialIncludesSkin}
            onStepChange={setTutorialStep}
            onSkinChange={selectSkin}
            onComplete={finishTutorial}
            onClose={closeTutorial}
          />
        ) : null}

        {mode === "skin" ? (
          <SkinSelectionPanel
            skinId={skinId}
            reduceMotion={reduceMotion}
            onSkinChange={selectSkin}
            onClose={closeTutorial}
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

function TutorialPanel({
  step,
  skinId,
  reduceMotion,
  canClose,
  includeSkinStep,
  onStepChange,
  onSkinChange,
  onComplete,
  onClose,
}: {
  step: number
  skinId: TeamTWorldSkinId
  reduceMotion: boolean
  canClose: boolean
  includeSkinStep: boolean
  onStepChange: (step: number) => void
  onSkinChange: (skinId: TeamTWorldSkinId) => void
  onComplete: () => void
  onClose: () => void
}) {
  const stepCount = includeSkinStep ? 3 : 2
  const isLastStep = step === stepCount - 1
  const titles = [
    "キャラクターを操作しよう",
    "遊んでコインを獲得",
    "プレイヤースキンを選択",
  ]
  const descriptions = [
    "歩く、ダッシュ、ジャンプ、うなずきを使いながら店内を探索します。",
    "コインを使って挑戦。ゲーム終了後は共通リザルトで結果を確認できます。",
    "選んだスキンはこの端末に保存され、次回も同じ姿で始まります。",
  ]

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#05030a]/70 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="arcade-tutorial-title"
        className="relative max-h-[calc(100%-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#b99a5c]/55 bg-[#0b0712]/96 shadow-[0_0_0_1px_rgba(155,108,255,0.2),0_0_70px_rgba(123,75,216,0.38)]"
      >
        <div className="h-1 bg-gradient-to-r from-[#42d9ff] via-[#9b6cff] to-[#d84bff]" />
        {canClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="チュートリアルを閉じる"
            className="absolute top-4 right-4 z-10 text-[#bdb3ca] hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        ) : null}

        <div className="p-5 sm:p-8">
          <div
            className="flex items-center gap-2"
            aria-label={`${step + 1} / ${stepCount}`}
          >
            {Array.from({ length: stepCount }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === step ? "w-10 bg-[#ffe6a8]" : index < step ? "w-5 bg-[#9b6cff]" : "w-5 bg-white/15"}`}
              />
            ))}
            <span className="ml-2 text-[11px] font-semibold tracking-[0.16em] text-[#9f96aa] uppercase">
              Tutorial {step + 1}/{stepCount}
            </span>
          </div>

          <div className="mt-6 pr-8">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#c8b4ff] uppercase">
              <SparklesIcon className="size-4" /> Welcome to the arcade
            </p>
            <h2
              id="arcade-tutorial-title"
              className="mt-2 text-2xl font-black tracking-wide text-[#f7f1e7] sm:text-3xl"
            >
              {titles[step]}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#b9b2a7]">
              {descriptions[step]}
            </p>
          </div>

          <div className="mt-7 min-h-52">
            {step === 0 ? <TutorialControls /> : null}
            {step === 1 ? <TutorialGameLoop /> : null}
            {includeSkinStep && step === 2 ? (
              <TutorialSkinPicker
                skinId={skinId}
                reduceMotion={reduceMotion}
                onChange={onSkinChange}
              />
            ) : null}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0}
              className="text-[#c9c0d2] hover:bg-white/[0.07] hover:text-white"
              onClick={() => onStepChange(step - 1)}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              戻る
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                className="h-11 rounded-xl border border-[#d8bf88] bg-[#4c2378] px-6 font-bold text-white shadow-[0_0_24px_rgba(155,108,255,0.42)] hover:bg-[#613392]"
                onClick={onComplete}
              >
                <CheckIcon data-icon="inline-start" />
                {includeSkinStep ? "このスキンで探索する" : "遊び方を閉じる"}
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 rounded-xl bg-[#4c2378] px-6 font-bold text-white hover:bg-[#613392]"
                onClick={() => onStepChange(step + 1)}
              >
                次へ
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function TutorialControls() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <TutorialFeature
        icon={<Gamepad2Icon />}
        title="移動"
        description="WASD または矢印キーで店内を歩きます。"
      >
        <div className="mt-4 grid w-fit grid-cols-3 gap-1 text-xs font-bold text-[#eee7f6]">
          <span />
          <Keycap>W</Keycap>
          <span />
          <Keycap>A</Keycap>
          <Keycap>S</Keycap>
          <Keycap>D</Keycap>
        </div>
      </TutorialFeature>
      <TutorialFeature
        icon={<GaugeIcon />}
        title="ダッシュ"
        description="Shiftを押しながら移動すると素早く走ります。"
      >
        <div className="mt-4">
          <Keycap wide>Shift</Keycap>
        </div>
      </TutorialFeature>
      <TutorialFeature
        icon={<SparklesIcon />}
        title="ジャンプ"
        description="Spaceでその場または移動しながらジャンプします。"
      >
        <div className="mt-4">
          <Keycap wide>Space</Keycap>
        </div>
      </TutorialFeature>
      <TutorialFeature
        icon={<CheckIcon />}
        title="うなずく"
        description="Eでキャラクターが肯定のリアクションをします。"
      >
        <div className="mt-4">
          <Keycap>E</Keycap>
        </div>
      </TutorialFeature>
      <TutorialFeature
        icon={<PlayIcon />}
        title="ゲームを起動"
        description="筐体へ近づき、Enterまたは筐体のクリックで詳細を開きます。"
      >
        <div className="mt-4">
          <Keycap wide>Enter</Keycap>
        </div>
      </TutorialFeature>
    </div>
  )
}

function TutorialGameLoop() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <TutorialFeature
        icon={<CoinsIcon />}
        title="コインで挑戦"
        description="ゲームごとに表示されたコインを使ってプレイします。"
      />
      <TutorialFeature
        icon={<TrophyIcon />}
        title="結果を確認"
        description="クリア報酬や失敗結果は、共通リザルト画面にまとまります。"
      />
      <TutorialFeature
        icon={<DoorOpenIcon />}
        title="アーケードを出る"
        description="入口側の帰還ゲートか、右上の終了ボタンを使います。"
      />
    </div>
  )
}

function TutorialFeature({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#9b6cff]/25 bg-white/[0.04] p-4">
      <div className="grid size-10 place-items-center rounded-xl bg-[#9b6cff]/15 text-[#c8b4ff] [&_svg]:size-5">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-[#f5eee4]">{title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-[#aaa1b2]">{description}</p>
      {children}
    </div>
  )
}

function Keycap({
  children,
  wide = false,
}: {
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <span
      className={`grid h-7 place-items-center rounded-md border border-white/20 bg-black/35 px-2 shadow-[inset_0_-2px_0_rgba(255,255,255,0.08)] ${wide ? "min-w-14" : "w-7"}`}
    >
      {children}
    </span>
  )
}

function SkinSelectionPanel({
  skinId,
  reduceMotion,
  onSkinChange,
  onClose,
}: {
  skinId: TeamTWorldSkinId
  reduceMotion: boolean
  onSkinChange: (skinId: TeamTWorldSkinId) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#05030a]/70 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="arcade-skin-title"
        className="relative max-h-[calc(100%-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#b99a5c]/55 bg-[#0b0712]/96 shadow-[0_0_0_1px_rgba(155,108,255,0.2),0_0_70px_rgba(123,75,216,0.38)]"
      >
        <div className="h-1 bg-gradient-to-r from-[#42d9ff] via-[#9b6cff] to-[#d84bff]" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="スキン選択を閉じる"
          className="absolute top-4 right-4 z-10 text-[#bdb3ca] hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          <XIcon />
        </Button>
        <div className="p-5 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#c8b4ff] uppercase">
            <ShirtIcon className="size-4" /> Player skin
          </p>
          <h2
            id="arcade-skin-title"
            className="mt-2 text-2xl font-black tracking-wide text-[#f7f1e7] sm:text-3xl"
          >
            プレイヤースキンを選択
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#b9b2a7]">
            選択はすぐにプレイヤーへ反映され、この端末に保存されます。
          </p>
          <div className="mt-7">
            <TutorialSkinPicker
              skinId={skinId}
              reduceMotion={reduceMotion}
              onChange={onSkinChange}
            />
          </div>
          <div className="mt-7 flex justify-end border-t border-white/10 pt-5">
            <Button
              type="button"
              className="h-11 rounded-xl border border-[#d8bf88] bg-[#4c2378] px-6 font-bold text-white shadow-[0_0_24px_rgba(155,108,255,0.42)] hover:bg-[#613392]"
              onClick={onClose}
            >
              <CheckIcon data-icon="inline-start" />
              このスキンに決定
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function TutorialSkinPicker({
  skinId,
  reduceMotion,
  onChange,
}: {
  skinId: TeamTWorldSkinId
  reduceMotion: boolean
  onChange: (skinId: TeamTWorldSkinId) => void
}) {
  const [previewAnimation, setPreviewAnimation] =
    React.useState<TeamTWorldPreviewAnimation>("idle")
  const selectedSkin =
    TEAM_T_WORLD_SKINS.find((skin) => skin.id === skinId) ??
    TEAM_T_WORLD_SKINS[0]
  const previewAnimations: readonly {
    id: TeamTWorldPreviewAnimation
    label: string
  }[] = [
    { id: "idle", label: "待機" },
    { id: "walk", label: "歩行" },
    { id: "sprint", label: "ダッシュ" },
    { id: "jump", label: "ジャンプ" },
    { id: "nod", label: "うなずく" },
  ]
  const previewAnimationLabel =
    previewAnimations.find((animation) => animation.id === previewAnimation)
      ?.label ?? "待機"

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.15fr)]">
      <div
        role="group"
        aria-label={`${selectedSkin.label}の${previewAnimationLabel}アニメーション3Dプレビュー`}
        className="relative min-h-64 overflow-hidden rounded-2xl border border-[#9b6cff]/35 bg-[#090510] shadow-[inset_0_0_40px_rgba(155,108,255,0.1)]"
      >
        <TeamTWorldSkinPreview
          skinId={selectedSkin.id}
          reduceMotion={reduceMotion}
          animation={previewAnimation}
        />
        <div
          className="absolute top-3 right-3 left-3 rounded-xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-sm"
          aria-label="プレビューアニメーション"
        >
          <span className="block px-1.5 pb-1 text-[10px] font-semibold tracking-[0.12em] text-[#aaa1b2] uppercase">
            プレビュー動作
          </span>
          <div className="flex flex-wrap gap-1">
            {previewAnimations.map((animation) => (
              <button
                key={animation.id}
                type="button"
                disabled={reduceMotion}
                aria-pressed={previewAnimation === animation.id}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${previewAnimation === animation.id ? "bg-[#6b36a5] text-white shadow-[0_0_12px_rgba(155,108,255,0.35)]" : "text-[#bbb1c6] hover:bg-white/10 hover:text-white"}`}
                onClick={() => setPreviewAnimation(animation.id)}
              >
                {animation.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-1">
        {TEAM_T_WORLD_SKINS.map((skin) => {
          const selected = skin.id === skinId
          return (
            <button
              key={skin.id}
              type="button"
              aria-pressed={selected}
              className={`group flex min-w-0 items-center gap-4 rounded-2xl border p-3 text-left transition-[border-color,background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#c8b4ff] focus-visible:outline-none ${selected ? "border-[#ffe6a8]/80 bg-[#9b6cff]/14 shadow-[0_0_24px_rgba(155,108,255,0.2)]" : "border-white/10 bg-white/[0.035] hover:border-[#9b6cff]/50 hover:bg-white/[0.06]"}`}
              onClick={() => onChange(skin.id)}
            >
              <span
                className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15"
                style={{
                  background: `linear-gradient(135deg, ${skin.preview[0]}, ${skin.preview[1]})`,
                }}
              >
                <PaletteIcon className="size-6 text-white drop-shadow" />
                {selected ? (
                  <span className="absolute right-1.5 bottom-1.5 grid size-5 place-items-center rounded-full bg-[#0b0712] text-[#ffe6a8]">
                    <CheckIcon className="size-3.5" />
                  </span>
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-[#f5eee4]">
                  {skin.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#aaa1b2]">
                  {skin.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
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
    <div className="h-full w-full scrollbar-gutter-stable overflow-y-auto bg-[#05030a] p-4 sm:p-6">
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
