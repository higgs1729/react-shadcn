export type HubGame = {
  id: string
  title: string
  genre: string
  description: string
  href?: string
  image?: string
  imageAlt?: string
  placeholder?: boolean
}

export const hubGames: readonly HubGame[] = [
  {
    id: "echo-shift",
    title: "ECHO//SHIFT",
    genre: "MEMORY SURVIVAL",
    description: "6秒前の自分から逃げ切る、60秒の記憶サバイバル。",
    href: "/games/echo-shift",
    image: "/game-previews/echo-shift-wide.png",
    imageAlt: "ECHO//SHIFTのゲームバナー",
  },
  {
    id: "neon-tunnel",
    title: "NEON TUNNEL",
    genre: "ARCADE RUNNER",
    description: "ネオンのトンネルを旋回し、障害物を避けて走破する。",
    href: "/games/neon-tunnel",
    image: "/game-previews/neon-tunnel.png",
    imageAlt: "NEON TUNNELのゲーム画面",
  },
  ...Array.from({ length: 4 }, (_, index) => ({
    id: `placeholder-${index + 1}`,
    title: `DUMMY SLOT ${String(index + 1).padStart(2, "0")}`,
    genre: "CATALOG PLACEHOLDER",
    description: "今後追加されるゲーム用の表示確認枠です。",
    placeholder: true,
  })),
]

export const playableGames = hubGames.filter((game) => !game.placeholder)
