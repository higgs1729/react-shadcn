"use client"

import * as React from "react"
import { Html, useGLTF } from "@react-three/drei"
import * as THREE from "three"

import {
  getTeamTWorldAssetUrl,
  TEAM_T_WORLD_PALETTE,
  WORLD_LAYOUT,
  WORLD_ROOM_FILES,
} from "@/lib/team-t-app/world"

import { cloneTinted } from "./team-t-world-materials"

const FLOOR_DARK = new THREE.Color("#3e3854")
const FLOOR_LIGHT = new THREE.Color("#75667f")
const WALL_TINT = new THREE.Color("#8a719b")
const TRIM_TINT = new THREE.Color("#75618e")

const FLOOR_SIZE = 4
const FLOOR_COLUMNS = 8
const FLOOR_ROWS = 6
const WALL_HEIGHT = 4

type SceneAsset = THREE.Group

function ArcadeFloor({ source }: { source: SceneAsset }) {
  const tiles = React.useMemo(
    () =>
      Array.from({ length: FLOOR_COLUMNS * FLOOR_ROWS }, (_, index) => {
        const column = index % FLOOR_COLUMNS
        const row = Math.floor(index / FLOOR_COLUMNS)
        return {
          object: cloneTinted(source, (column + row) % 2 ? FLOOR_DARK : FLOOR_LIGHT),
          position: [
            (column - (FLOOR_COLUMNS - 1) / 2) * FLOOR_SIZE,
            -0.03,
            (row - (FLOOR_ROWS - 1) / 2) * FLOOR_SIZE,
          ] as [number, number, number],
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

function ArcadeWalls({
  wall,
  window,
  door,
  corner,
  column,
}: {
  wall: SceneAsset
  window: SceneAsset
  door: SceneAsset
  corner: SceneAsset
  column: SceneAsset
}) {
  const pieces = React.useMemo(() => {
    const result: {
      object: THREE.Object3D
      position: [number, number, number]
      rotation: [number, number, number]
      scale: [number, number, number]
    }[] = []

    for (let index = 0; index < FLOOR_COLUMNS; index++) {
      const source = index === 3 ? door : index === 1 || index === 6 ? window : wall
      result.push({
        object: cloneTinted(source, WALL_TINT),
        position: [
          (index - (FLOOR_COLUMNS - 1) / 2) * FLOOR_SIZE,
          0,
          -WORLD_LAYOUT.roomHalfDepth,
        ],
        rotation: [0, 0, 0],
        scale: [FLOOR_SIZE, WALL_HEIGHT, 1],
      })
    }

    for (const side of [-1, 1] as const) {
      for (let index = 0; index < FLOOR_ROWS; index++) {
        result.push({
          object: cloneTinted(index === 2 ? window : wall, WALL_TINT),
          position: [
            side * WORLD_LAYOUT.roomHalfWidth,
            0,
            (index - (FLOOR_ROWS - 1) / 2) * FLOOR_SIZE,
          ],
          rotation: [0, Math.PI / 2, 0],
          scale: [FLOOR_SIZE, WALL_HEIGHT, 1],
        })
      }
    }

    for (const x of [-WORLD_LAYOUT.roomHalfWidth, WORLD_LAYOUT.roomHalfWidth]) {
      result.push({
        object: cloneTinted(corner, TRIM_TINT),
        position: [x, 0, -WORLD_LAYOUT.roomHalfDepth],
        rotation: [0, x < 0 ? 0 : -Math.PI / 2, 0],
        scale: [WALL_HEIGHT, WALL_HEIGHT, WALL_HEIGHT],
      })
      result.push({
        object: cloneTinted(column, TRIM_TINT),
        position: [x, 0, WORLD_LAYOUT.roomHalfDepth - 0.4],
        rotation: [0, 0, 0],
        scale: [WALL_HEIGHT, WALL_HEIGHT, WALL_HEIGHT],
      })
    }
    return result
  }, [column, corner, door, wall, window])

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

export function TeamTWorldRoom() {
  const floor = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.floor)).scene
  const wall = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.wall)).scene
  const window = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.window)).scene
  const door = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.door)).scene
  const corner = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.corner)).scene
  const column = useGLTF(getTeamTWorldAssetUrl(WORLD_ROOM_FILES.column)).scene

  return (
    <group>
      <ArcadeFloor source={floor} />
      <ArcadeWalls
        wall={wall}
        window={window}
        door={door}
        corner={corner}
        column={column}
      />

      <Html
        position={[0, 3.35, -11.5]}
        center
        transform
        distanceFactor={13}
        occlude
        zIndexRange={[1, 0]}
      >
        <div className="pointer-events-none whitespace-nowrap rounded-md border border-[#d8bf88]/70 bg-[#160d25]/90 px-5 py-2 text-center text-sm font-black tracking-[0.38em] text-[#ffe6a8] shadow-[0_0_24px_rgba(216,75,255,0.65)]">
          API ARCADE
        </div>
      </Html>

      <pointLight position={[-9, 3.6, -4]} color={TEAM_T_WORLD_PALETTE.magenta} intensity={16} distance={11} />
      <pointLight position={[9, 3.6, -4]} color={TEAM_T_WORLD_PALETTE.amethyst} intensity={18} distance={11} />
      <pointLight position={[0, 3.8, 6]} color={TEAM_T_WORLD_PALETTE.gold} intensity={11} distance={10} />
    </group>
  )
}

Object.values(WORLD_ROOM_FILES).forEach((file) =>
  useGLTF.preload(getTeamTWorldAssetUrl(file))
)
