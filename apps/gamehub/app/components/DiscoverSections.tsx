/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useState } from "react"
import { GameCard } from "./GameCard"
import { playableGames } from "../game-data"
import {
  chooseRecommended,
  countsFor,
  INITIAL_GAME_STATS,
  PERIOD_LABELS,
  POPULAR_PERIODS,
  sortNewest,
  sortPopular,
  type GameStats,
  type PopularPeriod,
} from "../lib/game-stats"
import { fetchGameStats } from "../lib/stats-api"
import { withBasePath } from "../lib/base-path"

export function DiscoverSections() {
  const [stats, setStats] = useState<GameStats>(INITIAL_GAME_STATS)
  const [period, setPeriod] = useState<PopularPeriod>("week")

  useEffect(() => {
    const controller = new AbortController()
    void fetchGameStats(controller.signal).then((remoteStats) => {
      if (remoteStats) setStats(remoteStats)
    })
    return () => controller.abort()
  }, [])

  const featured = useMemo(() => chooseRecommended(playableGames, stats), [stats])
  const popular = useMemo(
    () => sortPopular(playableGames, stats, period).slice(0, 3),
    [period, stats]
  )
  const newest = useMemo(() => sortNewest(playableGames).slice(0, 3), [])

  return (
    <>
      <section className="hub-featured" aria-labelledby="featured-title">
        <div className="hub-featured-media">
          <img src={featured.image} alt={featured.imageAlt} />
        </div>
        <div className="hub-featured-copy">
          <span className="hub-kicker">MAIN GAME / RECOMMENDED</span>
          <h1 id="featured-title">{featured.title}</h1>
          <p>{featured.description}</p>
          <a className="hub-primary-action" href={featured.href}>
            PLAY {featured.title} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section
        className="hub-discovery-section"
        aria-labelledby="popular-title"
        data-section-mark="POPULAR"
        data-register="01"
      >
        <div className="hub-section-heading is-small">
          <div>
            <span className="hub-kicker">WHAT PLAYERS OPEN FIRST</span>
            <h2 id="popular-title">POPULAR GAMES</h2>
          </div>
          <a href={withBasePath("/games")}>VIEW ALL</a>
        </div>
        <div className="hub-popular-periods" aria-label="人気の集計期間">
          {POPULAR_PERIODS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              className={period === option ? "is-active" : ""}
              onClick={() => setPeriod(option)}
            >
              {PERIOD_LABELS[option]}
            </button>
          ))}
        </div>
        <div className="hub-game-grid">
          {popular.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              compact
              rank={index + 1}
              statLabel={`${countsFor(game, stats)[period].toLocaleString()} PLAYS / ${PERIOD_LABELS[period]}`}
            />
          ))}
        </div>
      </section>

      <section
        className="hub-discovery-section"
        aria-labelledby="new-title"
        data-section-mark="NEW"
        data-register="02"
      >
        <div className="hub-section-heading is-small">
          <div>
            <span className="hub-kicker">RECENTLY ADDED</span>
            <h2 id="new-title">NEW GAMES</h2>
          </div>
          <a href={withBasePath("/games")}>BROWSE CATALOG</a>
        </div>
        <div className="hub-game-grid">
          {newest.map((game) => (
            <GameCard key={game.id} game={game} compact />
          ))}
        </div>
      </section>
    </>
  )
}
