/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NEON TUNNEL",
  description: "ネオンのトンネルを走破するアーケードランナー。",
}

export default function NeonTunnelPage() {
  return (
    <main className="hub-game-frame-page">
      <header className="hub-game-frame-header">
        <a href="/">← GAMEHUB</a>
        <strong>NEON TUNNEL</strong>
        <a href="/games">ALL GAMES</a>
      </header>
      <iframe
        className="hub-game-frame"
        src="/game-runtime/neon-tunnel.html"
        title="NEON TUNNEL"
        allow="fullscreen"
      />
    </main>
  )
}
