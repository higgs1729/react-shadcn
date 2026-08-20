import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

// These tests used to boot the Cloudflare Worker bundle and assert on a real
// Response. GAMEHUB is a plain Next.js app now, so the equivalent artifact is
// the prerendered HTML `next build` writes for each route. Reading the file is
// itself the route assertion: a route that failed to prerender has no file and
// readFile throws, which fails the test.
const outputRoot = fileURLToPath(new URL("../out/", import.meta.url))
const neonTunnelRuntime = fileURLToPath(
  new URL("../public/game-runtime/neon-tunnel.html", import.meta.url)
)

async function render(pathname = "/") {
  const routePath = pathname.replace(/^\//, "").replace(/\/$/, "")
  const relativePath = routePath ? `${routePath}/index.html` : "index.html"
  const html = await readFile(join(outputRoot, relativePath), "utf8")
  assert.match(html, /^<!DOCTYPE html>/i)
  return { html }
}

test("server-renders DISCOVER with ranked playable games", async () => {
  const { html } = await render()

  assert.match(html, /<title>GAMEHUB<\/title>/i)
  assert.match(html, /MAIN GAME \/ RECOMMENDED/)
  assert.match(html, /POPULAR GAMES/)
  assert.match(html, /1 WEEK/)
  assert.match(html, /250 PLAYS \/ 1 WEEK/)
  assert.doesNotMatch(html, /VIEW ALL|BROWSE CATALOG/)
  assert.doesNotMatch(html, /data-register="0[12]"/)
  assert.match(html, /NEW GAMES/)
  assert.match(html, /ALL GAMES/)
  assert.match(html, /ECHO\/\/SHIFT/)
  assert.match(html, /NEON TUNNEL/)
  assert.match(html, /PULSE\/\/TRACE/)
  // The static-export app owns /gamehub, so plain anchors must include its
  // basePath and trailing slash rather than relying on Next/link rewriting.
  assert.match(html, /href="\/gamehub\/games\/echo-shift\/"/)
  assert.match(html, /href="\/gamehub\/games\/neon-tunnel\/"/)
  assert.doesNotMatch(html, /DUMMY SLOT 01/)
  assert.match(html, /gamehub-previews\/pulse-trace\.png/)
  assert.doesNotMatch(html, /hub-card-badge|hub-play-label/)
  assert.match(html, /aria-current="page"[^>]*>DISCOVER/)
  assert.doesNotMatch(html, /SYSTEM LIVE|ORBIT FALL|TINY HEIST|CROWN\/O/)
  assert.doesNotMatch(html, /<footer\b/i)
})

test("server-renders the searchable ALL GAMES catalogue", async () => {
  const { html } = await render("/games")

  assert.match(html, /SEARCH THE CATALOG/)
  assert.doesNotMatch(html, /03 PLAYABLE \/ 04 DUMMY/)
  assert.doesNotMatch(html, /data-register="03"/)
  assert.match(html, /aria-current="page"[^>]*>ALL GAMES/)
  assert.match(html, /ECHO\/\/SHIFT/)
  assert.match(html, /NEON TUNNEL/)
  assert.match(html, /PULSE\/\/TRACE/)
  assert.match(html, /gamehub-previews\/pulse-trace\.png/)
  assert.match(html, /07<!-- --> RESULTS/)
  // Removed: JSON VIEW / CATALOG SIDEBAR / aria-label="Expand ..." /
  // data-json-path. Those four assertions described a JSON-tree sidebar that
  // has never existed in this app — at the vinext/Workers commit they matched
  // nothing outside this file, so they were failing before the migration too.
})

test("serves ECHO Shift from its GAMEHUB route", async () => {
  const { html } = await render("/games/echo-shift")

  assert.match(html, /ECHO\/\/SHIFT/)
  assert.match(html, /A 60 SECOND MEMORY TRAP/)
})

test("serves the NEON TUNNEL wrapper and original game asset", async () => {
  const { html } = await render("/games/neon-tunnel")

  assert.match(html, /NEON TUNNEL/)
  // The iframe is a raw HTML attribute, so basePath must be added by the
  // app's URL helper for the copied public asset to resolve on Pages.
  assert.match(html, /src="\/gamehub\/game-runtime\/neon-tunnel\.html"/)

  // GAMEHUB is independent from Team T API Lab; the runtime must not request
  // or depend on Team T's API-card image assets.
  const runtime = await readFile(neonTunnelRuntime, "utf8")
  assert.doesNotMatch(runtime, /api-cards|CARD_IDS|cardTextures|billboards/)
})
