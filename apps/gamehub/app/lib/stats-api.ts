import type { GameStats } from "./game-stats"

type StatsResponse = {
  games?: GameStats
}

const API_URL = process.env.NEXT_PUBLIC_GAMEHUB_STATS_API_URL?.replace(/\/$/, "")

export async function fetchGameStats(signal?: AbortSignal): Promise<GameStats | null> {
  if (!API_URL) return null

  try {
    const response = await fetch(`${API_URL}/v1/stats`, {
      cache: "no-store",
      signal,
    })
    if (!response.ok) return null
    const payload = (await response.json()) as StatsResponse
    return payload.games ?? null
  } catch {
    return null
  }
}

export function recordGamePlay(gameId: string): void {
  if (!API_URL || typeof window === "undefined") return

  const visitKey = `gamehub-play:${performance.timeOrigin}:${window.location.pathname}:${gameId}`
  if (window.sessionStorage.getItem(visitKey)) return
  window.sessionStorage.setItem(visitKey, "1")

  void fetch(`${API_URL}/v1/plays/${encodeURIComponent(gameId)}`, {
    method: "POST",
    keepalive: true,
  }).catch(() => undefined)
}
