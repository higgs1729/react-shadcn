"use client"

import * as React from "react"
import Image from "next/image"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GaugeIcon,
  Gamepad2Icon,
  PlayIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getTeamTGamePreviewUrl,
  getTeamTGameUrl,
  teamTGames,
  type TeamTGame,
} from "@/lib/team-t-app/games"

import { TeamTCoinBalance } from "./team-t-coin-balance"

// The second set makes the reset point visually identical to the start point,
// so the continuously moving carousel can loop without a visible jump.
const carouselGames = [...teamTGames, ...teamTGames]
const gamePopupFrameUrl = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/team-t-app/game-popup-frame.png`

function getSlideMetrics(carousel: HTMLDivElement) {
  const firstSlide = carousel.firstElementChild as HTMLElement | null
  if (!firstSlide) return null
  const gap = Number.parseFloat(getComputedStyle(carousel).gap) || 0
  return {
    firstWidth: firstSlide.offsetWidth,
    stride: firstSlide.offsetWidth + gap,
  }
}

interface TeamTGameDialogProps {
  open: boolean
  coinCount: number
  onOpenChange: (open: boolean) => void
  onSpend: (cost: number) => boolean
  onRefund: (cost: number) => void
  onAward: (coins: number) => void
}

type GameResult =
  | { status: "cleared"; coins: number }
  | { status: "failed" }
  | { status: "load-error" }
  | null

export function TeamTGameDialog({
  open,
  coinCount,
  onOpenChange,
  onSpend,
  onRefund,
  onAward,
}: TeamTGameDialogProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const settledRef = React.useRef(false)
  const [selectedGame, setSelectedGame] = React.useState<TeamTGame | null>(null)
  const [activeGame, setActiveGame] = React.useState<TeamTGame | null>(null)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const [result, setResult] = React.useState<GameResult>(null)

  const endGame = React.useCallback(
    (nextResult: GameResult, refund = false) => {
      const game = activeGame
      if (!game || settledRef.current) return

      settledRef.current = true
      if (refund) onRefund(game.cost)
      if (nextResult?.status === "cleared") onAward(nextResult.coins)
      setResult(nextResult)
      setSelectedGame(game)
      setActiveGame(null)
    },
    [activeGame, onAward, onRefund]
  )

  React.useEffect(() => {
    if (!activeGame || hasLoaded) return
    const timeout = window.setTimeout(
      () => endGame({ status: "load-error" }, true),
      10000
    )
    return () => window.clearTimeout(timeout)
  }, [activeGame, endGame, hasLoaded])

  React.useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const game = activeGame
      const iframe = iframeRef.current
      if (!game || !iframe || settledRef.current) return
      if (event.origin !== window.location.origin) return
      if (event.source !== iframe.contentWindow) return
      if (!event.data || typeof event.data !== "object") return

      const data = event.data as { type?: unknown; coin?: unknown }
      if (data.type !== "game:ended") return
      if (
        !Number.isInteger(data.coin) ||
        typeof data.coin !== "number" ||
        data.coin < 0 ||
        data.coin > game.maxReward
      ) {
        return
      }

      endGame(
        data.coin > 0
          ? { status: "cleared", coins: data.coin }
          : { status: "failed" }
      )
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [activeGame, endGame])

  const startGame = () => {
    if (!selectedGame || !onSpend(selectedGame.cost)) return
    settledRef.current = false
    setResult(null)
    setHasLoaded(false)
    setActiveGame(selectedGame)
  }

  const closeGame = (nextOpen: boolean) => {
    if (!nextOpen && activeGame && !settledRef.current) {
      settledRef.current = true
      setActiveGame(null)
    }
    if (!nextOpen) {
      setSelectedGame(null)
      setResult(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={closeGame}>
      <DialogContent
        className="team-t-midnight-surface dark aspect-[1678/942] h-auto w-[min(80rem,calc(100vw-2rem),calc((100dvh-2rem)*1.781))] max-w-none min-w-0 overflow-hidden border-0 bg-[#09090b] p-0 text-[#f7f1e7] shadow-[0_28px_90px_rgba(0,0,0,0.7)] sm:max-w-none"
        style={{
          backgroundImage: `url("${gamePopupFrameUrl}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">ゲーム</DialogTitle>
        <DialogDescription className="sr-only">
          ゲームを選び、コインを使って開始します。
        </DialogDescription>
        {/* padding % は containing block の幅基準。fixed配置のDialogContentでは
            viewport幅になってしまうため、静的なwrapperへ移してダイアログ幅基準にする。 */}
        <div className="h-full min-h-0 w-full min-w-0 overflow-hidden p-[4.6%]">
          {activeGame ? (
            <GameRuntime
              game={activeGame}
              iframeRef={iframeRef}
              hasLoaded={hasLoaded}
              onLoad={() => setHasLoaded(true)}
              onError={() => endGame({ status: "load-error" }, true)}
              onBack={() => {
                settledRef.current = true
                setSelectedGame(activeGame)
                setActiveGame(null)
              }}
            />
          ) : (
            <GameHub
              coinCount={coinCount}
              selectedGame={selectedGame}
              result={result}
              onClose={() => closeGame(false)}
              onSelect={(game) => {
                setSelectedGame(game)
                setResult(null)
              }}
              onStart={startGame}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GameHub({
  coinCount,
  selectedGame,
  result,
  onClose,
  onSelect,
  onStart,
}: {
  coinCount: number
  selectedGame: TeamTGame | null
  result: GameResult
  onClose: () => void
  onSelect: (game: TeamTGame) => void
  onStart: () => void
}) {
  const canPlay = Boolean(selectedGame && coinCount >= selectedGame.cost)
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const dragStartRef = React.useRef<{ x: number; scrollLeft: number } | null>(
    null
  )
  const draggedRef = React.useRef(false)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const syncActiveIndex = React.useCallback((carousel: HTMLDivElement) => {
    const metrics = getSlideMetrics(carousel)
    if (!metrics) return
    const centeredOffset =
      carousel.scrollLeft + carousel.clientWidth / 2 - metrics.firstWidth / 2
    const rawIndex = Math.round(centeredOffset / metrics.stride)
    const nextIndex =
      ((rawIndex % teamTGames.length) + teamTGames.length) % teamTGames.length
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex))
  }, [])

  React.useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.scrollLeft = 0
    syncActiveIndex(carousel)

    const metrics = getSlideMetrics(carousel)
    if (!metrics) return

    const loopDistance = metrics.stride * teamTGames.length
    let frame = 0
    let previousTime = performance.now()
    const move = (time: number) => {
      const elapsed = time - previousTime
      previousTime = time
      if (!dragStartRef.current) {
        carousel.scrollLeft += elapsed * 0.065
      }
      if (carousel.scrollLeft >= loopDistance) {
        carousel.scrollLeft -= loopDistance
      }
      syncActiveIndex(carousel)
      frame = window.requestAnimationFrame(move)
    }

    frame = window.requestAnimationFrame(move)
    return () => window.cancelAnimationFrame(frame)
  }, [syncActiveIndex])

  const moveToIndex = (index: number) => {
    const carousel = carouselRef.current
    if (!carousel) return
    const metrics = getSlideMetrics(carousel)
    if (!metrics) return
    carousel.scrollLeft = Math.max(
      0,
      metrics.stride * index - (carousel.clientWidth - metrics.firstWidth) / 2
    )
    syncActiveIndex(carousel)
  }

  return (
    <div className="h-full min-w-0 overflow-hidden rounded-md bg-transparent text-[#f7f1e7]">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#b99a5c]/35 bg-black/25 px-4 backdrop-blur-sm sm:px-6">
          <span className="grid size-10 place-items-center rounded-lg border border-[#b99a5c]/55 bg-[#4c2378] text-white shadow-[0_0_24px_rgba(139,92,246,0.28)]">
            <Gamepad2Icon className="size-5" aria-hidden="true" />
          </span>
          <TeamTCoinBalance coins={coinCount} className="ml-auto text-base" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="ゲーム画面を閉じる"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </header>
        <main
          className={`min-h-0 min-w-0 overflow-y-auto px-4 sm:px-6 ${
            selectedGame ? "flex-[0_1_auto] pt-5 pb-3" : "flex-1 pt-8 pb-8"
          }`}
        >
          <div className="min-w-0">
            <div className="relative px-9 sm:px-12">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="absolute top-1/2 left-0 z-20 -translate-y-1/2 border border-[#b99a5c]/45 bg-black/55 text-[#d8bf88] shadow-lg hover:bg-[#4c2378] hover:text-white"
                aria-label="前のゲームを表示"
                onClick={() =>
                  moveToIndex(
                    (activeIndex - 1 + teamTGames.length) % teamTGames.length
                  )
                }
              >
                <ChevronLeftIcon />
              </Button>
              <div
                ref={carouselRef}
                className="flex w-full min-w-0 [scrollbar-width:none] gap-5 overflow-x-auto py-3 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onPointerDown={(event) => {
                  dragStartRef.current = {
                    x: event.clientX,
                    scrollLeft: event.currentTarget.scrollLeft,
                  }
                  draggedRef.current = false
                }}
                onPointerMove={(event) => {
                  const dragStart = dragStartRef.current
                  if (!dragStart) return
                  const delta = event.clientX - dragStart.x
                  if (Math.abs(delta) > 4 && !draggedRef.current) {
                    draggedRef.current = true
                    event.currentTarget.setPointerCapture(event.pointerId)
                  }
                  event.currentTarget.scrollLeft = dragStart.scrollLeft - delta
                  syncActiveIndex(event.currentTarget)
                }}
                onPointerUp={(event) => {
                  dragStartRef.current = null
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId)
                  }
                }}
                onPointerCancel={() => {
                  dragStartRef.current = null
                }}
              >
                {carouselGames.map((game, index) => {
                  const selected = selectedGame?.id === game.id
                  return (
                    <article
                      key={`${game.id}-${index}`}
                      aria-hidden={index >= teamTGames.length || undefined}
                      className="group relative w-64 flex-none overflow-hidden rounded-xl border border-[#9b8050]/55 bg-[#08090b]/95 text-left shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#c2a66e]/80 data-[selected=true]:border-[#9b6cff] data-[selected=true]:shadow-[0_0_0_1px_#9b6cff,0_0_28px_rgba(139,92,246,0.48)]"
                      data-selected={selected}
                    >
                      <div className="h-40 overflow-hidden border-b border-[#9b8050]/45 bg-black">
                        <Image
                          src={getTeamTGamePreviewUrl(game)}
                          alt={`${game.title} のプレビュー`}
                          width={1280}
                          height={720}
                          unoptimized
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <div className="p-3.5">
                        <h2 className="font-medium text-[#f7f1e7]">
                          {game.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-sm text-[#aaa59b]">
                          {game.description}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-[#aaa59b]">
                          <span className="inline-flex items-center gap-1">
                            <GaugeIcon className="size-3" /> {game.difficulty}
                          </span>
                          <TeamTCoinBalance
                            coins={game.maxReward}
                            prefix="+"
                            label={false}
                            className="gap-1 text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="absolute inset-0 z-10 rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`${game.title}を選択`}
                        aria-pressed={selected}
                        tabIndex={index >= teamTGames.length ? -1 : 0}
                        onClick={() => {
                          if (!draggedRef.current) {
                            moveToIndex(index % teamTGames.length)
                            onSelect(game)
                          }
                          draggedRef.current = false
                        }}
                      />
                    </article>
                  )
                })}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="absolute top-1/2 right-0 z-20 -translate-y-1/2 border border-[#b99a5c]/45 bg-black/55 text-[#d8bf88] shadow-lg hover:bg-[#4c2378] hover:text-white"
                aria-label="次のゲームを表示"
                onClick={() =>
                  moveToIndex((activeIndex + 1) % teamTGames.length)
                }
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <div
              className="mt-3 flex justify-center gap-3"
              role="tablist"
              aria-label="ゲーム選択"
            >
              {teamTGames.map((game, index) => (
                <button
                  key={game.id}
                  type="button"
                  role="tab"
                  aria-label={`${game.title}を中央に表示`}
                  aria-selected={activeIndex === index}
                  className="size-3 rounded-full border border-[#c0a46c] bg-[#473d2d] transition-[background-color,box-shadow,transform] data-[active=true]:scale-125 data-[active=true]:border-[#b79cff] data-[active=true]:bg-[#9b6cff] data-[active=true]:shadow-[0_0_12px_rgba(155,108,255,0.9)]"
                  data-active={activeIndex === index}
                  onClick={() => moveToIndex(index)}
                />
              ))}
            </div>
          </div>
        </main>
        {selectedGame ? (
          <footer className="flex min-h-40 flex-1 items-center border-t border-[#b99a5c]/45 bg-black/28 px-4 py-4 backdrop-blur-sm sm:px-8">
            <div className="grid w-full items-center gap-5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:gap-7">
              <div className="aspect-video w-full max-w-56 overflow-hidden rounded-xl border border-[#9b6cff] bg-black shadow-[0_0_22px_rgba(139,92,246,0.3)] sm:max-w-none">
                <Image
                  src={getTeamTGamePreviewUrl(selectedGame)}
                  alt={`${selectedGame.title} のプレビュー`}
                  width={1280}
                  height={720}
                  unoptimized
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl leading-tight font-semibold tracking-wide text-[#f4e8d1] sm:text-4xl">
                  {selectedGame.title}
                </h2>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-[#b9b2a7] sm:text-lg">
                  {selectedGame.description}
                </p>
                {result ? (
                  <div className="mt-3">
                    <GameResultNotice result={result} />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col items-center gap-2 sm:justify-self-end">
                <Button
                  type="button"
                  disabled={!canPlay}
                  onClick={onStart}
                  className="h-20 min-w-56 rounded-xl border border-[#c7ab70] bg-[#4c2378] px-10 text-2xl font-semibold text-white shadow-[0_0_0_3px_rgba(183,156,255,0.12),0_0_30px_rgba(139,92,246,0.5),0_14px_32px_rgba(0,0,0,0.55)] hover:bg-[#613392] [&_svg]:size-7"
                >
                  <PlayIcon data-icon="inline-start" />
                  プレイ
                </Button>
                <TeamTCoinBalance
                  coins={selectedGame.cost}
                  prefix="-"
                  label={false}
                  className="text-base"
                />
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

function GameRuntime({
  game,
  iframeRef,
  hasLoaded,
  onLoad,
  onError,
  onBack,
}: {
  game: TeamTGame
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  hasLoaded: boolean
  onLoad: () => void
  onError: () => void
  onBack: () => void
}) {
  return (
    <div className="relative h-full w-full bg-black">
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-background/85 p-1 pr-3 text-sm shadow-sm backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="ゲーム一覧へ戻る"
          onClick={onBack}
        >
          <ChevronLeftIcon />
        </Button>
        <span className="font-medium">{game.title}</span>
      </div>
      {!hasLoaded ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background text-sm text-muted-foreground">
          読み込み中
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        title={`${game.title} ゲーム`}
        src={getTeamTGameUrl(game)}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  )
}

function GameResultNotice({ result }: { result: Exclude<GameResult, null> }) {
  if (result.status === "cleared") {
    return <TeamTCoinBalance coins={result.coins} prefix="+" label={false} />
  }

  return (
    <p className="text-sm text-muted-foreground">
      {result.status === "load-error"
        ? "コインを返却しました。"
        : "また挑戦できます。"}
    </p>
  )
}
