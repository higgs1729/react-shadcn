/* eslint-disable @next/next/no-img-element */
import type { HubGame } from "../game-data"

type GameCardProps = {
  game: HubGame
  compact?: boolean
  rank?: number
  statLabel?: string
}

function CardContents({ game, rank, statLabel }: GameCardProps) {
  return (
    <>
      <span className="hub-card-media">
        {game.image ? (
          <img src={game.image} alt={game.imageAlt ?? ""} />
        ) : (
          <span className="hub-placeholder-media" aria-hidden="true">
            <b>DUMMY</b>
            <small>NOT PLAYABLE</small>
          </span>
        )}
      </span>
      <span className="hub-card-details">
        <span>
          {rank ? <small className="hub-card-rank">#{rank}</small> : null}
          <strong>{game.title}</strong>
          <small>{game.genre}</small>
          {statLabel ? <small className="hub-card-stat">{statLabel}</small> : null}
        </span>
      </span>
    </>
  )
}

export function GameCard({ game, compact = false, rank, statLabel }: GameCardProps) {
  const className = [
    "hub-game-card",
    compact ? "is-compact" : "",
    game.placeholder ? "is-placeholder" : "",
  ]
    .filter(Boolean)
    .join(" ")

  if (!game.href || game.placeholder) {
    return (
      <article
        className={className}
        aria-label={`${game.title}（ダミー表示・プレイ不可）`}
      >
        <CardContents game={game} rank={rank} statLabel={statLabel} />
      </article>
    )
  }

  return (
    <a
      className={className}
      href={game.href}
      aria-label={`${game.title}をプレイ`}
    >
      <CardContents game={game} rank={rank} statLabel={statLabel} />
    </a>
  )
}
