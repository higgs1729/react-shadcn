import type { HubGame } from "../game-data"

export const POPULAR_PERIODS = ["day", "week", "month", "year"] as const
export type PopularPeriod = (typeof POPULAR_PERIODS)[number]

export type PlayCounts = Record<PopularPeriod, number>
export type GameStats = Record<string, PlayCounts>

export const PERIOD_LABELS: Record<PopularPeriod, string> = {
  day: "1 DAY",
  week: "1 WEEK",
  month: "1 MONTH",
  year: "1 YEAR",
}

export const INITIAL_GAME_STATS: GameStats = {
  "neon-tunnel": { day: 18, week: 130, month: 720, year: 720 },
  "echo-shift": { day: 29, week: 180, month: 460, year: 460 },
  "pulse-trace": { day: 44, week: 250, month: 380, year: 380 },
}

const EMPTY_COUNTS: PlayCounts = { day: 0, week: 0, month: 0, year: 0 }

export function countsFor(game: HubGame, stats: GameStats): PlayCounts {
  return stats[game.id] ?? INITIAL_GAME_STATS[game.id] ?? EMPTY_COUNTS
}

export function sortPopular(
  games: readonly HubGame[],
  stats: GameStats,
  period: PopularPeriod
): HubGame[] {
  return [...games]
    .filter((game) => !game.placeholder && game.href)
    .sort((a, b) => {
      const countDifference = countsFor(b, stats)[period] - countsFor(a, stats)[period]
      if (countDifference !== 0) return countDifference
      return b.uploadedAt.localeCompare(a.uploadedAt) || a.id.localeCompare(b.id)
    })
}

export function sortNewest(games: readonly HubGame[]): HubGame[] {
  return [...games]
    .filter((game) => !game.placeholder && game.href)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt) || a.id.localeCompare(b.id))
}

function recencyScore(game: HubGame, now: number): number {
  const ageDays = Math.max(
    0,
    (now - Date.parse(`${game.uploadedAt}T00:00:00Z`)) / 86_400_000
  )
  return Math.max(0, 1 - ageDays / 90)
}

export function chooseRecommended(
  games: readonly HubGame[],
  stats: GameStats,
  now = Date.now()
): HubGame {
  const playable = games.filter((game) => !game.placeholder && game.href)
  const maxPopularity = Math.max(
    1,
    ...playable.map((game) => Math.log1p(countsFor(game, stats).month))
  )

  return [...playable].sort((a, b) => {
    const score = (game: HubGame) => {
      const popularity = Math.log1p(countsFor(game, stats).month) / maxPopularity
      return popularity * 0.55 + recencyScore(game, now) * 0.45
    }
    return (
      score(b) - score(a) ||
      b.uploadedAt.localeCompare(a.uploadedAt) ||
      a.id.localeCompare(b.id)
    )
  })[0]
}
