"use client"

import * as React from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

import {
  getTeamTWorldAssetUrl,
  TEAM_T_WORLD_PALETTE,
  teamTWorldProps,
  WORLD_HERO_STAGE,
  WORLD_LAYOUT,
  WORLD_ROOM_FILES,
} from "@/lib/team-t-app/world"

import { cloneTinted } from "./team-t-world-materials"

// ゾーン別の床。中央=紫の市松、受付(左)=クールなタイル、ラウンジ(右)=暖色の木目。
const FLOOR_CENTER = [
  new THREE.Color("#75667f"),
  new THREE.Color("#3e3854"),
] as const
const FLOOR_RECEPTION = [
  new THREE.Color("#42606a"),
  new THREE.Color("#2f4750"),
] as const
const FLOOR_LOUNGE = [
  new THREE.Color("#7c5c3f"),
  new THREE.Color("#5b4330"),
] as const
// 各ゾーンの床の境界(左右非対称)。受付=この値以左、ラウンジ=この値以右。
const RECEPTION_EDGE_X = -16
const LOUNGE_EDGE_X = 12

const WALL_TINT = new THREE.Color("#8a719b")
const TRIM_TINT = new THREE.Color("#75618e")

const FLOOR_SIZE = 4
const MIN_X = WORLD_LAYOUT.roomMinX
const MAX_X = WORLD_LAYOUT.roomMaxX
const HALF_D = WORLD_LAYOUT.roomHalfDepth
// 左アンカーの床グリッド。左端タイル中心=MIN_X+半マス、以降 +FLOOR_SIZE。
const FLOOR_COLUMNS = (MAX_X - MIN_X) / FLOOR_SIZE // 52 / 4 = 13
const FLOOR_ROWS = 9 // 9 × 4 = 36 ≒ 奥行 34
const TILE0_X = MIN_X + FLOOR_SIZE / 2 // 最左タイルの中心 X
const tileX = (column: number) => TILE0_X + column * FLOOR_SIZE
const WALL_HEIGHT = WORLD_LAYOUT.wallHeight

type SceneAsset = THREE.Object3D

/** 市松の床。ゾーン化した広いフロアを 11×9 で敷く。 */
function ArcadeFloor({ source }: { source: SceneAsset }) {
  const tiles = React.useMemo(
    () =>
      Array.from({ length: FLOOR_COLUMNS * FLOOR_ROWS }, (_, index) => {
        const column = index % FLOOR_COLUMNS
        const row = Math.floor(index / FLOOR_COLUMNS)
        const x = tileX(column)
        const palette =
          x <= RECEPTION_EDGE_X
            ? FLOOR_RECEPTION
            : x >= LOUNGE_EDGE_X
              ? FLOOR_LOUNGE
              : FLOOR_CENTER
        return {
          object: cloneTinted(source, palette[(column + row) % 2]),
          position: [x, -0.03, (row - (FLOOR_ROWS - 1) / 2) * FLOOR_SIZE] as [
            number,
            number,
            number,
          ],
        }
      }),
    [source]
  )

  return tiles.map((tile, index) => (
    <primitive
      key={index}
      object={tile.object}
      position={tile.position}
      scale={[FLOOR_SIZE, 1, FLOOR_SIZE]}
    />
  ))
}

/**
 * 外周の壁。奥壁(-Z)は満月を覗かせる全面ガラス、側壁(±X)は中央に窓。
 * 入口側(+Z)は追従カメラの視界を塞がないよう開けたままにし、四隅は柱で締める。
 */
function ArcadeWalls({
  wall,
  window: windowAsset,
  column,
}: {
  wall: SceneAsset
  window: SceneAsset
  column: SceneAsset
}) {
  const pieces = React.useMemo(() => {
    const result: {
      object: THREE.Object3D
      position: [number, number, number]
      rotation: [number, number, number]
      scale: [number, number, number]
    }[] = []
    const wallScale: [number, number, number] = [FLOOR_SIZE, WALL_HEIGHT, 1]

    // 奥壁(-Z): 全面ガラス(満月の窓)
    for (let c = 0; c < FLOOR_COLUMNS; c++) {
      result.push({
        object: cloneTinted(windowAsset, WALL_TINT),
        position: [tileX(c), 0, -HALF_D],
        rotation: [0, 0, 0],
        scale: wallScale,
      })
    }
    // 側壁(±X): 全面ふつうの壁(窓は置かない)。左=MIN_X / 右=MAX_X。
    for (const wallX of [MIN_X, MAX_X] as const) {
      for (let r = 0; r < FLOOR_ROWS; r++) {
        result.push({
          object: cloneTinted(wall, WALL_TINT),
          position: [wallX, 0, (r - (FLOOR_ROWS - 1) / 2) * FLOOR_SIZE],
          rotation: [0, wallX < 0 ? Math.PI / 2 : -Math.PI / 2, 0],
          scale: wallScale,
        })
      }
    }
    // 四隅の柱(継ぎ目隠し＋入口の門柱)
    for (const x of [MIN_X, MAX_X]) {
      for (const z of [-HALF_D, HALF_D]) {
        result.push({
          object: cloneTinted(column, TRIM_TINT),
          position: [x, 0, z],
          rotation: [0, 0, 0],
          scale: [WALL_HEIGHT, WALL_HEIGHT, WALL_HEIGHT],
        })
      }
    }
    return result
  }, [column, wall, windowAsset])

  return pieces.map((piece, index) => (
    <primitive
      key={index}
      object={piece.object}
      position={piece.position}
      rotation={piece.rotation}
      scale={piece.scale}
    />
  ))
}

/** HERO 筐体の台座。段上に据えて浮きを消す。金の縁で見せ場にする。 */
function HeroDais() {
  const [x, , z] = WORLD_HERO_STAGE.center
  const h = WORLD_HERO_STAGE.daisHeight
  const r = WORLD_HERO_STAGE.daisRadius
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r + 0.25, h, 56]} />
        <meshStandardMaterial color="#1a1330" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, h + 0.01, 0]}>
        <ringGeometry args={[r - 0.35, r, 56]} />
        <meshBasicMaterial
          color={TEAM_T_WORLD_PALETTE.gold}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

// 什器で使う一意なファイル一覧と URL(hook の安定入力)。
const PROP_FILES = Array.from(new Set(teamTWorldProps.map((p) => p.file)))
const PROP_URLS = PROP_FILES.map(getTeamTWorldAssetUrl)

/** 景品カウンター・ラウンジの什器。各プロップを tint 付きで複製配置する。 */
function Furnishings() {
  const gltfs = useGLTF(PROP_URLS) as unknown as {
    scene: THREE.Object3D
  }[]

  const items = React.useMemo(() => {
    const sceneByFile = new Map(PROP_FILES.map((f, i) => [f, gltfs[i].scene]))
    // モデルごとに原点が中心でない(角ピボット)ものがある。各モデルを XZ 中心へ
    // 寄せて床(Y=0)へ接地させ、position を視覚中心・回転を中心軸に正規化する。
    const offsetByFile = new Map(
      PROP_FILES.map((f, i) => {
        const box = new THREE.Box3().setFromObject(gltfs[i].scene)
        const center = box.getCenter(new THREE.Vector3())
        return [
          f,
          [-center.x, -box.min.y, -center.z] as [number, number, number],
        ]
      })
    )
    return teamTWorldProps.map((prop) => {
      const source = sceneByFile.get(prop.file)
      return {
        object: source ? cloneTinted(source, new THREE.Color(prop.tint)) : null,
        offset:
          offsetByFile.get(prop.file) ??
          ([0, 0, 0] as [number, number, number]),
        position: prop.position as [number, number, number],
        rotationY: prop.rotationY,
        scale: prop.scale,
      }
    })
  }, [gltfs])

  return items.map((item, index) =>
    item.object ? (
      <group
        key={index}
        position={item.position}
        rotation={[0, item.rotationY, 0]}
        scale={item.scale}
      >
        <primitive object={item.object} position={item.offset} />
      </group>
    ) : null
  )
}

export function TeamTWorldRoom() {
  const floor = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.floor)).scene
  const wall = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.wall)).scene
  const windowAsset = useGLTF(
    getTeamTWorldAssetUrl(WORLD_ROOM_FILES.window)
  ).scene
  const column = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.column)).scene

  return (
    <group>
      <ArcadeFloor source={floor} />
      <ArcadeWalls wall={wall} window={windowAsset} column={column} />
      <HeroDais />
      <React.Suspense fallback={null}>
        <Furnishings />
      </React.Suspense>

      {/* 仮の点光源。Phase C で提灯・行灯・月光・ブルームへ差し替える。 */}
      <pointLight
        position={[-14, 3.6, -2]}
        color={TEAM_T_WORLD_PALETTE.magenta}
        intensity={22}
        distance={20}
        decay={1.8}
      />
      <pointLight
        position={[14, 3.6, -2]}
        color={TEAM_T_WORLD_PALETTE.amethyst}
        intensity={22}
        distance={20}
        decay={1.8}
      />
      <pointLight
        position={[0, 3.8, 9]}
        color={TEAM_T_WORLD_PALETTE.gold}
        intensity={16}
        distance={18}
        decay={1.8}
      />
      <pointLight
        position={[0, 3.8, -11]}
        color={TEAM_T_WORLD_PALETTE.amethyst}
        intensity={16}
        distance={16}
        decay={1.8}
      />
    </group>
  )
}

Object.values(WORLD_ROOM_FILES).forEach((file) =>
  useGLTF.preload(getTeamTWorldAssetUrl(file))
)
PROP_URLS.forEach((url) => useGLTF.preload(url))
