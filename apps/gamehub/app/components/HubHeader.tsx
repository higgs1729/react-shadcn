import { withBasePath } from "../lib/base-path"

type HubHeaderProps = {
  active: "discover" | "all-games"
}

export function HubHeader({ active }: HubHeaderProps) {
  return (
    <header className="hub-header">
      <a className="hub-brand" href={withBasePath("/")} aria-label="GAMEHUB トップへ">
        GAMEHUB
      </a>
      <nav className="hub-nav" aria-label="メインナビゲーション">
        <a
          className={active === "discover" ? "is-active" : undefined}
          href={withBasePath("/")}
          aria-current={active === "discover" ? "page" : undefined}
        >
          DISCOVER
        </a>
        <a
          className={active === "all-games" ? "is-active" : undefined}
          href={withBasePath("/games")}
          aria-current={active === "all-games" ? "page" : undefined}
        >
          ALL GAMES
        </a>
      </nav>
    </header>
  )
}
