"use client"

import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getTeamTGameUrl, type TeamTGame } from "@/lib/team-t-app/games"

/**
 * ゲーム側契約の実装。旧 team-t-game-dialog.tsx(APIワールド導入で削除)の
 * GameRuntime と postMessage / タイムアウト / 返却ロジックを **逐語的に**
 * 移設したもの。ロジックの改善・整理はしていない。相違点はホスト状態
 * (activeGame state → game prop、setState → onSettle コールバック)への
 * 差し替えのみ。移設元の差分は git 履歴で確認できる。
 *
 * 契約の正本: `app/(team-t)/team-t-app/docs/game-selection.md`
 */

export type TeamTGameResult =
  | { status: "cleared"; coins: number }
  | { status: "failed" }
  | { status: "load-error" }

export function TeamTGameRuntime({
  game,
  onRefund,
  onAward,
  onSettle,
  onBack,
}: {
  game: TeamTGame
  onRefund: (cost: number) => void
  onAward: (coins: number) => void
  /** 契約が結着したときに結果を親へ通知する(playing モードを抜ける)。 */
  onSettle: (result: TeamTGameResult) => void
  /** 結着前にユーザーがワールドへ戻る。コインは返却しない(元 GameRuntime の onBack と同じ)。 */
  onBack: () => void
}) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const settledRef = React.useRef(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  const endGame = React.useCallback(
    (nextResult: TeamTGameResult, refund = false) => {
      if (settledRef.current) return

      settledRef.current = true
      if (refund) onRefund(game.cost)
      if (nextResult.status === "cleared") onAward(nextResult.coins)
      onSettle(nextResult)
    },
    [game, onAward, onRefund, onSettle]
  )

  React.useEffect(() => {
    if (hasLoaded) return
    const timeout = window.setTimeout(
      () => endGame({ status: "load-error" }, true),
      10000
    )
    return () => window.clearTimeout(timeout)
  }, [endGame, hasLoaded])

  React.useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const iframe = iframeRef.current
      if (!iframe || settledRef.current) return
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
  }, [game, endGame])

  return (
    <div className="relative h-full w-full bg-black">
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 rounded-full bg-background/85 p-1 pr-3 text-sm shadow-sm backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="ワールドへ戻る"
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
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
        onLoad={() => setHasLoaded(true)}
        onError={() => endGame({ status: "load-error" }, true)}
      />
    </div>
  )
}
