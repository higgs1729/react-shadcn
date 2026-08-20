/// <reference types="@cloudflare/workers-types" />

const GAME_IDS = ["echo-shift", "neon-tunnel", "pulse-trace"] as const
type GameId = (typeof GAME_IDS)[number]
type Period = "day" | "week" | "month" | "year"
type Env = { DB: D1Database; ALLOWED_ORIGINS?: string }

const PERIODS: Record<Period, number> = {
  day: 24,
  week: 24 * 7,
  month: 24 * 30,
  year: 24 * 365,
}

function isGameId(value: string): value is GameId {
  return GAME_IDS.includes(value as GameId)
}

function allowedOrigin(request: Request, env: Env): string {
  const origin = request.headers.get("Origin") ?? ""
  const allowed = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  return allowed.includes(origin) ? origin : allowed[0] ?? "*"
}

function responseHeaders(request: Request, env: Env): Headers {
  return new Headers({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": allowedOrigin(request, env),
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  })
}

function json(request: Request, env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request, env),
  })
}

function currentHour(): string {
  return `${new Date().toISOString().slice(0, 13)}:00:00Z`
}

function emptyStats(): Record<GameId, Record<Period, number>> {
  return Object.fromEntries(
    GAME_IDS.map((gameId) => [gameId, { day: 0, week: 0, month: 0, year: 0 }])
  ) as Record<GameId, Record<Period, number>>
}

async function getStats(env: Env) {
  const rows = await env.DB.prepare(
    "SELECT game_id, hour, play_count FROM game_play_hourly"
  ).all<{ game_id: string; hour: string; play_count: number }>()
  const stats = emptyStats()
  const now = Date.now()

  for (const row of rows.results) {
    if (!isGameId(row.game_id)) continue
    const ageHours = (now - Date.parse(row.hour)) / 3_600_000
    for (const [period, hours] of Object.entries(PERIODS) as [Period, number][]) {
      if (ageHours >= 0 && ageHours < hours) stats[row.game_id][period] += row.play_count
    }
  }

  return stats
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: responseHeaders(request, env) })
    }

    const url = new URL(request.url)
    if (request.method === "GET" && url.pathname === "/health") {
      return json(request, env, { ok: true })
    }

    if (request.method === "POST" && url.pathname.startsWith("/v1/plays/")) {
      const gameId = url.pathname.slice("/v1/plays/".length)
      if (!isGameId(gameId)) return json(request, env, { error: "Unknown game" }, 404)
      await env.DB.prepare(
        `INSERT INTO game_play_hourly (game_id, hour, play_count)
         VALUES (?, ?, 1)
         ON CONFLICT(game_id, hour) DO UPDATE SET play_count = play_count + 1`
      )
        .bind(gameId, currentHour())
        .run()
      return new Response(null, { status: 204, headers: responseHeaders(request, env) })
    }

    if (request.method === "GET" && url.pathname === "/v1/stats") {
      return json(request, env, {
        generatedAt: new Date().toISOString(),
        games: await getStats(env),
      })
    }

    return json(request, env, { error: "Not found" }, 404)
  },
}

export default worker
