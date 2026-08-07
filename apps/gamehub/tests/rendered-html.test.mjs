import assert from "node:assert/strict"
import test from "node:test"

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url)
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`)
  const { default: worker } = await import(workerUrl.href)

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    }
  )
}

test("server-renders DISCOVER with a featured game and explicit dummy slots", async () => {
  const response = await render()
  assert.equal(response.status, 200)
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i)

  const html = await response.text()
  assert.match(html, /<title>GAMEHUB<\/title>/i)
  assert.match(html, /MAIN GAME \/ FEATURED/)
  assert.match(html, /POPULAR GAMES/)
  assert.match(html, /NEW GAMES/)
  assert.match(html, /ALL GAMES/)
  assert.match(html, /ECHO\/\/SHIFT/)
  assert.match(html, /NEON TUNNEL/)
  assert.match(html, /href="\/games\/echo-shift"/)
  assert.match(html, /href="\/games\/neon-tunnel"/)
  assert.match(html, /DUMMY SLOT 01/)
  assert.match(html, /NOT PLAYABLE/)
  assert.doesNotMatch(html, /hub-card-badge|hub-play-label/)
  assert.match(html, /aria-current="page"[^>]*>DISCOVER/)
  assert.doesNotMatch(html, /SYSTEM LIVE|ORBIT FALL|TINY HEIST|CROWN\/O/)
  assert.doesNotMatch(html, /<footer\b/i)
})

test("server-renders the searchable ALL GAMES catalogue", async () => {
  const response = await render("/games")
  assert.equal(response.status, 200)

  const html = await response.text()
  assert.match(html, /SEARCH THE CATALOG/)
  assert.match(html, /02 PLAYABLE \/ 04 DUMMY/)
  assert.match(html, /aria-current="page"[^>]*>ALL GAMES/)
  assert.match(html, /ECHO\/\/SHIFT/)
  assert.match(html, /NEON TUNNEL/)
  assert.match(html, /JSON VIEW/)
  assert.match(html, /CATALOG SIDEBAR/)
  assert.match(html, /aria-label="Expand ECHO\/\/SHIFT"/)
  assert.match(html, /data-json-path="games\.0"/)
})

test("serves ECHO Shift from its GAMEHUB route", async () => {
  const response = await render("/games/echo-shift")
  assert.equal(response.status, 200)

  const html = await response.text()
  assert.match(html, /ECHO\/\/SHIFT/)
  assert.match(html, /A 60 SECOND MEMORY TRAP/)
})

test("serves the NEON TUNNEL wrapper and original game asset", async () => {
  const response = await render("/games/neon-tunnel")
  assert.equal(response.status, 200)

  const html = await response.text()
  assert.match(html, /NEON TUNNEL/)
  assert.match(html, /src="\/game-runtime\/neon-tunnel\.html"/)
})
