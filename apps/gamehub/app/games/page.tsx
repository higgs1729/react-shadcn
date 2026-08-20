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
      >
        <div className="hub-section-heading">
          <div>
            <span className="hub-kicker">FIND YOUR NEXT GAME</span>
            <h1 id="all-games-title">ALL GAMES</h1>
          </div>
        </div>
        <GameCatalog games={hubGames} />
      </section>
    </main>
  )
}
