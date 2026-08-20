import type { Metadata } from "next"
import { PlayCountTracker } from "../../components/PlayCountTracker"
import { withBasePath } from "../../lib/base-path"

export const metadata: Metadata = {
  title: "NEON TUNNEL",
  description: "ネオンのトンネルを走破するアーケードランナー。",
}

export default function NeonTunnelPage() {
  return (
    <>
      <PlayCountTracker gameId="neon-tunnel" />
      <main className="hub-game-frame-page">
      <header className="hub-game-frame-header">
        <a href={withBasePath("/")}>← GAMEHUB</a>
        <strong>NEON TUNNEL</strong>
        <a href={withBasePath("/games")}>ALL GAMES</a>
      </header>
      <iframe
        className="hub-game-frame"
        src={withBasePath("/game-runtime/neon-tunnel.html")}
        title="NEON TUNNEL"
        allow="fullscreen"
      />
      </main>
    </>
  )
}
