export const teamTGames = [
  {
    id: "triple-tile",
    fileName: "Tilegame.html",
    previewFileName: "triple-tile.png",
    title: "Triple Tile",
    description: "同じタイルを3つそろえる、気軽なパズル。",
    difficulty: "やさしい",
    cost: 1,
    maxReward: 1,
  },
  {
    id: "target",
    fileName: "target.html",
    previewFileName: "target.png",
    title: "的あてゲーム",
    description: "制限時間内にターゲットを狙う反射神経ゲーム。",
    difficulty: "やさしい",
    cost: 1,
    maxReward: 3,
  },
  {
    id: "slide-puzzle",
    fileName: "pazuru.html",
    previewFileName: "slide-puzzle.png",
    title: "スライドパズル",
    description: "数字を並べ替えて完成を目指す定番パズル。",
    difficulty: "ふつう",
    cost: 1,
    maxReward: 2,
  },
  {
    id: "picross",
    fileName: "picross.html",
    previewFileName: "picross.png",
    title: "ピクロス",
    description: "数字を手がかりに絵を完成させるロジックパズル。",
    difficulty: "ふつう",
    cost: 1,
    maxReward: 2,
  },
  {
    id: "survival",
    fileName: "undertale.html",
    previewFileName: "survival.png",
    title: "よけるサバイバル",
    description: "迫る攻撃を避け続けるサバイバルアクション。",
    difficulty: "ふつう",
    cost: 2,
    maxReward: 2,
  },
  {
    id: "block-breaker",
    fileName: "burroku.html",
    previewFileName: "block-breaker.png",
    title: "ブロック崩し",
    description: "ボールを跳ね返してブロックを壊すアーケードゲーム。",
    difficulty: "むずかしい",
    cost: 2,
    maxReward: 3,
  },
  {
    id: "rpg",
    fileName: "game.html",
    previewFileName: "rpg.png",
    title: "ミニRPG",
    description: "ダンジョンを探索する、短編3D RPG。",
    difficulty: "むずかしい",
    cost: 3,
    maxReward: 3,
  },
  {
    id: "shooting",
    fileName: "syuuthingu.html",
    previewFileName: "shooting.png",
    title: "ゾンビシューター",
    description: "ゾンビから生き延びる3Dシューティング。",
    difficulty: "むずかしい",
    cost: 3,
    maxReward: 3,
  },
  {
    id: "neon-tunnel",
    fileName: "neon-tunnel.html",
    previewFileName: "neon-tunnel.png",
    title: "ネオントンネル",
    description: "光の回廊を駆け抜ける、制限時間つき3Dランナー。",
    difficulty: "むずかしい",
    cost: 3,
    maxReward: 3,
  },
] as const

export type TeamTGame = (typeof teamTGames)[number]

export function getTeamTGameUrl(game: TeamTGame) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return `${basePath}/team-t-app/games/${encodeURIComponent(game.fileName)}`
}

export function getTeamTGamePreviewUrl(game: TeamTGame) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return `${basePath}/team-t-app/game-previews/${encodeURIComponent(game.previewFileName)}`
}
