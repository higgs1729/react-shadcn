import { teamTGames, type TeamTGame } from "./games"

/** APIアーケード(3Dゲーム選択)の純データ。 */

export const TEAM_T_WORLD_PALETTE = {
  void: "#05030a",
  ink: "#f7f1e7",
  amethyst: "#9b6cff",
  magenta: "#d84bff",
  violet: "#7b4bd8",
  gold: "#d8bf88",
  goldBright: "#ffe6a8",
} as const

/** 店内の寸法と操作判定。座標系は y-up、入口側が +Z。 */
export const WORLD_LAYOUT = {
  roomHalfWidth: 16,
  roomHalfDepth: 12,
  collisionRadius: 0.65,
  interactDistance: 3.6,
  exitInteractDistance: 2.8,
  exitPosition: [0, 0, 9.8] as const,
  spawnPosition: [0, 0, 6.2] as const,
} as const

/** Kenney Arcade Pack から採用した店内構造モデル。 */
export const WORLD_ROOM_FILES = {
  floor: "arcade/floor.glb",
  wall: "arcade/wall.glb",
  corner: "arcade/wall-corner.glb",
  door: "arcade/wall-door-rotate.glb",
  window: "arcade/wall-window.glb",
  column: "arcade/column.glb",
} as const

/** ゲームごとに異なる実機を割り当てる。 */
export const WORLD_MACHINE_FILES = [
  "arcade/arcade-machine.glb",
  "arcade/pinball.glb",
  "arcade/claw-machine.glb",
  "arcade/air-hockey.glb",
  "arcade/basketball-game.glb",
  "arcade/dance-machine.glb",
  "arcade/gambling-machine.glb",
  "arcade/prize-wheel.glb",
  "arcade/ticket-machine.glb",
] as const

type MachineFile = (typeof WORLD_MACHINE_FILES)[number]

/** ゲーム内容と実機の形を対応させる。ゲーム順ではなく id で拘束する。 */
const WORLD_MACHINE_ASSIGNMENTS: Record<
  TeamTGame["id"],
  { file: MachineFile; scale: number; collisionRadius: number }
> = {
  "triple-tile": {
    file: "arcade/claw-machine.glb",
    scale: 3,
    collisionRadius: 1.6,
  },
  target: {
    file: "arcade/basketball-game.glb",
    scale: 2.8,
    collisionRadius: 1.8,
  },
  "slide-puzzle": {
    file: "arcade/ticket-machine.glb",
    scale: 3,
    collisionRadius: 1.4,
  },
  picross: {
    file: "arcade/gambling-machine.glb",
    scale: 3.4,
    collisionRadius: 1.5,
  },
  survival: {
    file: "arcade/air-hockey.glb",
    scale: 2.8,
    collisionRadius: 1.8,
  },
  "block-breaker": {
    file: "arcade/pinball.glb",
    scale: 3.2,
    collisionRadius: 1.6,
  },
  rpg: {
    file: "arcade/arcade-machine.glb",
    scale: 3.6,
    collisionRadius: 1.5,
  },
  shooting: {
    file: "arcade/arcade-machine.glb",
    scale: 3.6,
    collisionRadius: 1.5,
  },
  "neon-tunnel": {
    file: "arcade/dance-machine.glb",
    scale: 2.8,
    collisionRadius: 1.8,
  },
}

/** 単独プレイヤー。移動ロジックは維持し、見た目だけ Arcade Pack へ差し替える。 */
export const WORLD_AVATAR_FILE = "arcade/character-gamer.glb"

export const WORLD_ASSET_FILES = [
  ...Object.values(WORLD_ROOM_FILES),
  ...WORLD_MACHINE_FILES,
  WORLD_AVATAR_FILE,
] as const

export function getTeamTWorldAssetUrl(fileName: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return `${basePath}/team-t-app/world/models/${fileName}`
}

export interface TeamTWorldKiosk {
  game: TeamTGame
  index: number
  position: readonly [number, number, number]
  rotationY: number
  machineFile: MachineFile
  scale: number
  collisionRadius: number
}

const DIFFICULTY_ORDER: Record<TeamTGame["difficulty"], number> = {
  やさしい: 0,
  ふつう: 1,
  むずかしい: 2,
}

/**
 * 入口から奥へ向かうほど難しくなる配置。
 * 奥壁に5台、左右壁に2台ずつ置き、中央の移動通路を広く残す。
 */
const KIOSK_PLACEMENTS = [
  { position: [-13, 0, 3.5], rotationY: Math.PI / 2 },
  { position: [13, 0, 3.5], rotationY: -Math.PI / 2 },
  { position: [-13, 0, -3], rotationY: Math.PI / 2 },
  { position: [13, 0, -3], rotationY: -Math.PI / 2 },
  { position: [-10, 0, -9.5], rotationY: 0 },
  { position: [-5, 0, -9.5], rotationY: 0 },
  { position: [0, 0, -9.5], rotationY: 0 },
  { position: [5, 0, -9.5], rotationY: 0 },
  { position: [10, 0, -9.5], rotationY: 0 },
] as const

export const teamTWorldKiosks: readonly TeamTWorldKiosk[] = [...teamTGames]
  .sort(
    (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
  )
  .map((game, index) => {
    const machine = WORLD_MACHINE_ASSIGNMENTS[game.id]
    return {
      game,
      index,
      ...KIOSK_PLACEMENTS[index],
      machineFile: machine.file,
      scale: machine.scale,
      collisionRadius: machine.collisionRadius,
    }
  })
