"use client"

import { useMemo, useState } from "react"
import { GameCard } from "./GameCard"
import type { HubGame } from "../game-data"

export function GameCatalog({ games }: { games: readonly HubGame[] }) {
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredGames = useMemo(
    () =>
      games.filter((game) =>
        `${game.title} ${game.genre}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      ),
    [games, normalizedQuery]
  )

  return (
    <>
      <div className="hub-search-row">
        <label className="hub-search">
          <span>SEARCH THE CATALOG</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="GAME TITLE OR GENRE"
          />
        </label>
        <span className="hub-result-count" aria-live="polite">
          {String(filteredGames.length).padStart(2, "0")} RESULTS
        </span>
      </div>

      {filteredGames.length > 0 ? (
        <div className="hub-game-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p className="hub-empty-state">NO GAMES MATCH “{query}”</p>
      )}
    </>
  )
}
