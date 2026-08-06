import { teamTGames, type TeamTGame } from "./games"
import type { TeamTWorldSkinId } from "./preferences"

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

/** 同一ゲーマーモデルへ適用する色・発光アクセント違いのスキン。 */
export const TEAM_T_WORLD_SKINS: readonly {
  id: TeamTWorldSkinId
  label: string
  description: string
  tint: string
  emissive: string
  preview: readonly [string, string]
}[] = [
  {
    id: "violet",
    label: "ネオンバイオレット",
    description: "アーケードの紫光になじむ定番カラー",
    tint: "#d9c8ff",
    emissive: "#9b6cff",
    preview: ["#9b6cff", "#d84bff"],
  },
  {
    id: "cyan",
    label: "サイバーシアン",
    description: "青緑の光が映えるクールなカラー",
    tint: "#b9f3ff",
    emissive: "#42d9ff",
    preview: ["#42d9ff", "#5478ff"],
  },
  {
    id: "sunset",
    label: "サンセットゴールド",
    description: "金とマゼンタを合わせた暖色カラー",
    tint: "#ffe0b8",
    emissive: "#ff9d5c",
    preview: ["#ffe6a8", "#ff6fae"],
  },
  {
    id: "mono",
    label: "ミッドナイトモノ",
    description: "落ち着いた白銀のハイコントラスト",
    tint: "#e1e5f0",
    emissive: "#f7f1e7",
    preview: ["#f7f1e7", "#626779"],
  },
]

/**
 * 店内の寸法と操作判定。座標系は y-up、入口側が +Z、奥(満月の窓)が -Z。
 * ゾーン分割アーケードへ拡張(44×34)。左(-X)=景品、右(+X)=ラウンジ、中央=筐体島。
 */
export const WORLD_LAYOUT = {
  // 左右非対称。ラウンジを広げるため右壁だけ外へ(左=-22 固定 / 右=+30)。
  roomMinX: -22,
  roomMaxX: 30,
  roomHalfDepth: 17,
  wallHeight: 4,
  collisionRadius: 0.65,
  interactDistance: 3.6,
  exitInteractDistance: 2.8,
  exitPosition: [0, 0, 15.5] as const,
  spawnPosition: [0, 0, 13] as const,
} as const

/** Kenney Mini Arcade から採用した店内構造モデル。 */
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

/** 休憩ラウンジ用(Kenney Furniture Kit、外部テクスチャなし)。 */
export const WORLD_FURNITURE_FILES = {
  sofa: "furniture/lounge-sofa.glb",
  chairRelax: "furniture/lounge-chair-relax.glb",
  chairModern: "furniture/chair-modern-cushion.glb",
  tableCoffee: "furniture/table-coffee.glb",
  sideTable: "furniture/side-table.glb",
  lampFloor: "furniture/lamp-round-floor.glb",
  rug: "furniture/rug-rounded.glb",
  plantPotted: "furniture/potted-plant.glb",
  plantSmall: "furniture/plant-small-1.glb",
} as const

/** 景品・軽食コーナー用(Kenney Mini Market、外部カラーマップ参照)。 */
export const WORLD_MARKET_FILES = {
  freezer: "market/freezer.glb",
  shelfBoxes: "market/shelf-boxes.glb",
  shelfBags: "market/shelf-bags.glb",
  basket: "market/shopping-basket.glb",
  displayBread: "market/display-bread.glb",
} as const

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
  survival: { file: "arcade/air-hockey.glb", scale: 2.8, collisionRadius: 1.8 },
  "block-breaker": {
    file: "arcade/pinball.glb",
    scale: 3.2,
    collisionRadius: 1.6,
  },
  rpg: { file: "arcade/arcade-machine.glb", scale: 3.6, collisionRadius: 1.5 },
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
  ...Object.values(WORLD_FURNITURE_FILES),
  ...Object.values(WORLD_MARKET_FILES),
  WORLD_AVATAR_FILE,
] as const

export function getTeamTWorldAssetUrl(fileName: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  return `${basePath}/world/models/${fileName}`
}

// 向きの規約: rotationY=0 は +Z(入口)向き、π/2 は +X、-π/2 は -X、π は -Z(奥)向き。
const FACE_POS_X = Math.PI / 2
const FACE_NEG_X = -Math.PI / 2
const FACE_ENTRANCE = 0 // +Z 向き

/** HERO(見せ場)筐体の台座。浮いて見えないよう段上に据える。月光の額装は Phase C。 */
export const WORLD_HERO_STAGE = {
  center: [0, 0, -12] as const,
  daisHeight: 0.36,
  daisRadius: 3.7,
} as const

/**
 * 筐体スロット(空間配置)。ゲームの中身から独立させ、両アプリで再利用できる骨格にする。
 * メインフロア中央に背中合わせの島を2つ置き、外側の通路へ画面を向ける。最奥中央に
 * HERO スロット(台座付きの見せ場)。難易度は入口(手前 +Z)側がやさしく、奥ほど難しい
 * ので、スロットは手前→奥→HERO の順に並べ、難易度昇順のゲームを流し込む。
 */
export interface TeamTWorldMachineSlot {
  position: readonly [number, number, number]
  rotationY: number
  /** 見せ場スロット。台座と(Phase Cで)月光の額装を付ける。 */
  feature?: boolean
}

const MACHINE_SLOTS: readonly TeamTWorldMachineSlot[] = [
  // 手前列(Z=+2)= やさしい寄り。島A(左)/島B(右)の前段、外向き・内向きを交互に。
  // 内側筐体を X=±4、外側を ±7 に寄せ、中央通路を 2マス(8ユニット)に絞る。
  { position: [-7, 0, 2], rotationY: FACE_NEG_X }, // 島A 外(左通路向き)
  { position: [7, 0, 2], rotationY: FACE_POS_X }, // 島B 外(右通路向き)
  { position: [-4, 0, 2], rotationY: FACE_POS_X }, // 島A 内(中央通路向き)
  { position: [4, 0, 2], rotationY: FACE_NEG_X }, // 島B 内(中央通路向き)
  // 奥列(Z=-5)= ふつう〜むずかしい。
  { position: [-7, 0, -5], rotationY: FACE_NEG_X }, // 島A 外
  { position: [7, 0, -5], rotationY: FACE_POS_X }, // 島B 外
  { position: [-4, 0, -5], rotationY: FACE_POS_X }, // 島A 内
  { position: [4, 0, -5], rotationY: FACE_NEG_X }, // 島B 内
  // 最奥中央 = HERO(最難関)。台座上に据え、入口を向き、満月の窓を背にする。
  {
    position: [
      WORLD_HERO_STAGE.center[0],
      WORLD_HERO_STAGE.daisHeight,
      WORLD_HERO_STAGE.center[2],
    ],
    rotationY: FACE_ENTRANCE,
    feature: true,
  },
]

export interface TeamTWorldKiosk {
  game: TeamTGame
  index: number
  position: readonly [number, number, number]
  rotationY: number
  machineFile: MachineFile
  scale: number
  collisionRadius: number
  feature: boolean
}

const DIFFICULTY_ORDER: Record<TeamTGame["difficulty"], number> = {
  やさしい: 0,
  ふつう: 1,
  むずかしい: 2,
}

export const teamTWorldKiosks: readonly TeamTWorldKiosk[] = [...teamTGames]
  .sort(
    (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
  )
  .map((game, index) => {
    const machine = WORLD_MACHINE_ASSIGNMENTS[game.id]
    const slot = MACHINE_SLOTS[index]
    return {
      game,
      index,
      position: slot.position,
      rotationY: slot.rotationY,
      machineFile: machine.file,
      scale: machine.scale,
      collisionRadius: machine.collisionRadius,
      feature: Boolean(slot.feature),
    }
  })

/**
 * 装飾プロップ(什器)。景品カウンター(左)と休憩ラウンジ(右)を埋める。
 * tint は cloneTinted で material color に乗算する色。collisionRadius があるものだけ
 * アバターが押し戻される(rug・小物は素通り可)。
 */
export interface TeamTWorldProp {
  file: string
  position: readonly [number, number, number]
  rotationY: number
  scale: number
  tint: string
  collisionRadius?: number
}

const WARM = "#e8d2c0" // 木・布を軽く暖色へ
const COOL = "#d6cbe6" // 什器を室内の薄紫へ
const SOFA_TINT = "#c85a4a"

/**
 * 休憩ラウンジ(右 +X)。一行 = [ソファ|テーブル|ソファ] を X 軸方向に並べ、
 * ソファ2脚はテーブルを挟んで向かい合わせる。これを奥行き(Z)方向に 4 行反復する。
 * X は右島の外側(±7)と右壁(22)の間、12〜20 に収める。
 */
// 右壁を +30 へ広げたぶん、席は X=16/20/24 に置いて両側に通路を確保する。
const LOUNGE_ROW_Z = [-10.5, -3.5, 3.5, 10.5] as const
const loungeSeating: TeamTWorldProp[] = LOUNGE_ROW_Z.flatMap((z) => [
  // rug は長辺 X(1.57)なので回転なし。table は長辺 X なので 90° 回して長辺を Z に。
  {
    file: WORLD_FURNITURE_FILES.rug,
    position: [20, 0.02, z],
    rotationY: 0,
    scale: 5.6,
    tint: "#c98f7a",
  },
  {
    file: WORLD_FURNITURE_FILES.sofa,
    position: [16, 0, z],
    rotationY: FACE_POS_X,
    scale: 2.6,
    tint: SOFA_TINT,
    collisionRadius: 1.3,
  },
  {
    file: WORLD_FURNITURE_FILES.tableCoffee,
    position: [20, 0, z],
    rotationY: Math.PI / 2,
    scale: 2.4,
    tint: WARM,
    collisionRadius: 0.9,
  },
  {
    file: WORLD_FURNITURE_FILES.sofa,
    position: [24, 0, z],
    rotationY: FACE_NEG_X,
    scale: 2.6,
    tint: SOFA_TINT,
    collisionRadius: 1.3,
  },
])

export const teamTWorldProps: readonly TeamTWorldProp[] = [
  // ── 休憩ラウンジ(右 +X): 向かい合わせソファ席 × 4 行 ──
  ...loungeSeating,

  // ── 景品カウンター(左 -X)──
  {
    file: WORLD_MARKET_FILES.shelfBoxes,
    position: [-20.5, 0, 0],
    rotationY: FACE_POS_X,
    scale: 3,
    tint: COOL,
    collisionRadius: 1.4,
  },
  {
    file: WORLD_MARKET_FILES.shelfBags,
    position: [-20.5, 0, 4],
    rotationY: FACE_POS_X,
    scale: 3,
    tint: COOL,
    collisionRadius: 1.4,
  },
  {
    file: WORLD_MARKET_FILES.shelfBoxes,
    position: [-20.5, 0, -4],
    rotationY: FACE_POS_X,
    scale: 3,
    tint: COOL,
    collisionRadius: 1.4,
  },
  {
    file: WORLD_MARKET_FILES.displayBread,
    position: [-17, 0, 7],
    rotationY: FACE_POS_X,
    scale: 3,
    tint: WARM,
    collisionRadius: 1,
  },
  {
    file: WORLD_MARKET_FILES.freezer,
    position: [-20.5, 0, 8],
    rotationY: FACE_POS_X,
    scale: 3,
    tint: COOL,
    collisionRadius: 1.2,
  },
  {
    file: WORLD_MARKET_FILES.basket,
    position: [-16, 0, 3],
    rotationY: 0.6,
    scale: 3,
    tint: WARM,
  },
]

/**
 * アバターが押し戻される円形コライダー。筐体＋衝突ありプロップを一括で持つ。
 * (移動判定は avatar が毎フレームこれを読む)
 */
export const teamTWorldColliders: readonly {
  x: number
  z: number
  radius: number
}[] = [
  ...teamTWorldKiosks.map((k) => ({
    x: k.position[0],
    z: k.position[2],
    radius: k.collisionRadius,
  })),
  ...teamTWorldProps
    .filter((p) => p.collisionRadius)
    .map((p) => ({
      x: p.position[0],
      z: p.position[2],
      radius: p.collisionRadius as number,
    })),
]
