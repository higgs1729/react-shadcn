/* eslint-disable @next/next/no-img-element */
import { GameCard } from "./components/GameCard"
import { HubHeader } from "./components/HubHeader"
import { hubGames, playableGames } from "./game-data"
import { withBasePath } from "./lib/base-path"

const echoShift = playableGames[0]
const neonTunnel = playableGames[1]
const placeholders = hubGames.filter((game) => game.placeholder)

export default function DiscoverPage() {
  return (
    <main className="hub-page">
      <HubHeader active="discover" />

      <div className="hub-content hub-discover-content">
        <section className="hub-featured" aria-labelledby="featured-title">
          <div className="hub-featured-media">
            <img src={echoShift.image} alt={echoShift.imageAlt} />
          </div>
          <div className="hub-featured-copy">
            <span className="hub-kicker">MAIN GAME / FEATURED</span>
            <h1 id="featured-title">ECHO//SHIFT</h1>
            <p>{echoShift.description}</p>
            <a className="hub-primary-action" href={echoShift.href}>
              PLAY ECHO//SHIFT <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section
          className="hub-discovery-section"
          aria-labelledby="popular-title"
          data-section-mark="POPULAR"
          data-register="01"
        >
          <div className="hub-section-heading is-small">
            <div>
              <span className="hub-kicker">WHAT PLAYERS OPEN FIRST</span>
              <h2 id="popular-title">POPULAR GAMES</h2>
            </div>
            <a href={withBasePath("/games")}>VIEW ALL</a>
          </div>
          <div className="hub-game-grid">
            <GameCard game={echoShift} compact />
            <GameCard game={neonTunnel} compact />
            <GameCard game={placeholders[0]} compact />
          </div>
        </section>

        <section
          className="hub-discovery-section"
          aria-labelledby="new-title"
          data-section-mark="NEW"
          data-register="02"
        >
          <div className="hub-section-heading is-small">
            <div>
              <span className="hub-kicker">RECENTLY ADDED</span>
              <h2 id="new-title">NEW GAMES</h2>
            </div>
            <a href={withBasePath("/games")}>BROWSE CATALOG</a>
          </div>
          <div className="hub-game-grid">
            <GameCard game={neonTunnel} compact />
            <GameCard game={placeholders[1]} compact />
            <GameCard game={placeholders[2]} compact />
          </div>
        </section>
      </div>
    </main>
  )
}
