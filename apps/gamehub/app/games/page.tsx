import type { Metadata } from "next"
import { GameCatalog } from "../components/GameCatalog"
import { HubHeader } from "../components/HubHeader"
import { hubGames } from "../game-data"

export const metadata: Metadata = {
  title: "ALL GAMES",
  description: "GAMEHUBのゲームカタログ。タイトルやジャンルから検索できます。",
}

export default function AllGamesPage() {
  return (
    <main className="hub-page">
      <HubHeader active="all-games" />
      <section
        className="hub-content hub-catalog-content"
        aria-labelledby="all-games-title"
        data-section-mark="CATALOG"
        data-register="03"
      >
        <div className="hub-section-heading">
          <div>
            <span className="hub-kicker">FIND YOUR NEXT GAME</span>
            <h1 id="all-games-title">ALL GAMES</h1>
          </div>
          <span className="hub-count">03 PLAYABLE / 04 DUMMY</span>
        </div>
        <GameCatalog games={hubGames} />
      </section>
    </main>
  )
}
