"use client"

import * as React from "react"
import { useAnimations, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import {
  getTeamTWorldAssetUrl,
  teamTWorldKiosks,
  WORLD_AVATAR_FILE,
  WORLD_LAYOUT,
} from "@/lib/team-t-app/world"

import type { WorldControlState } from "./team-t-world-controls"

const MOVE_SPEED = 6.5 // units / sec
const TURN_LERP = 0.18
const AVATAR_SCALE = 2.4

/** names の中から pattern 群に最初に一致するクリップ名を返す(無ければ先頭)。 */
function pickClip(names: string[], patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const hit = names.find((name) => pattern.test(name))
    if (hit) return hit
  }
  return names[0]
}

export function TeamTWorldAvatar({
  controlsRef,
  positionRef,
  reduceMotion,
}: {
  controlsRef: React.RefObject<WorldControlState>
  /** アバターのワールド座標を毎フレーム書き込む共有 ref(カメラ・近接判定が読む)。 */
  positionRef: React.RefObject<THREE.Vector3>
  reduceMotion: boolean
}) {
  const groupRef = React.useRef<THREE.Group>(null)
  const url = getTeamTWorldAssetUrl(WORLD_AVATAR_FILE)
  const { scene, animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, groupRef)

  const idleName = React.useMemo(
    () => pickClip(names, [/idle/i, /breath/i, /stand/i]),
    [names]
  )
  const walkName = React.useMemo(
    () => pickClip(names, [/walk/i, /run/i, /jog/i]),
    [names]
  )
  const currentActionRef = React.useRef<string | null>(null)
  const headingRef = React.useRef(0)

  const playAction = React.useCallback(
    (name: string | undefined) => {
      if (!name || currentActionRef.current === name) return
      const next = actions[name]
      if (!next) return
      const prev = currentActionRef.current
        ? actions[currentActionRef.current]
        : null
      prev?.fadeOut(0.2)
      next.reset().fadeIn(0.2).play()
      currentActionRef.current = name
    },
    [actions]
  )

  React.useEffect(() => {
    // 初期姿勢。reduceMotion なら待機アニメを止め静止させる。
    if (reduceMotion) {
      Object.values(actions).forEach((action) => action?.stop())
      currentActionRef.current = null
    } else {
      playAction(idleName)
    }
    return () => {
      Object.values(actions).forEach((action) => action?.stop())
      currentActionRef.current = null
    }
  }, [actions, idleName, playAction, reduceMotion])

  useFrame((_, rawDelta) => {
    const group = groupRef.current
    const controls = controlsRef.current
    if (!group || !controls) return
    const delta = Math.min(rawDelta, 0.05) // タブ復帰時の巨大 delta を抑える

    let moveX = (controls.right ? 1 : 0) - (controls.left ? 1 : 0)
    let moveZ = (controls.back ? 1 : 0) - (controls.forward ? 1 : 0)
    const moving = moveX !== 0 || moveZ !== 0

    if (moving) {
      const length = Math.hypot(moveX, moveZ)
      moveX /= length
      moveZ /= length

      const candidate = new THREE.Vector3(
        group.position.x + moveX * MOVE_SPEED * delta,
        0,
        group.position.z + moveZ * MOVE_SPEED * delta
      )

      // 店内の矩形境界から外へ出ないようにする。
      candidate.x = THREE.MathUtils.clamp(
        candidate.x,
        -WORLD_LAYOUT.roomHalfWidth + WORLD_LAYOUT.collisionRadius,
        WORLD_LAYOUT.roomHalfWidth - WORLD_LAYOUT.collisionRadius
      )
      candidate.z = THREE.MathUtils.clamp(
        candidate.z,
        -WORLD_LAYOUT.roomHalfDepth + WORLD_LAYOUT.collisionRadius,
        WORLD_LAYOUT.roomHalfDepth - WORLD_LAYOUT.collisionRadius
      )

      // 各筐体の占有円から押し出す。
      for (const kiosk of teamTWorldKiosks) {
        const kx = kiosk.position[0]
        const kz = kiosk.position[2]
        const dx = candidate.x - kx
        const dz = candidate.z - kz
        const dist = Math.hypot(dx, dz)
        const minDist = kiosk.collisionRadius + WORLD_LAYOUT.collisionRadius
        if (dist > 0 && dist < minDist) {
          candidate.x = kx + (dx / dist) * minDist
          candidate.z = kz + (dz / dist) * minDist
        }
      }

      group.position.x = candidate.x
      group.position.z = candidate.z

      // 進行方向へ向く。
      const targetHeading = Math.atan2(moveX, moveZ)
      if (reduceMotion) {
        headingRef.current = targetHeading
      } else {
        let diff = targetHeading - headingRef.current
        diff = Math.atan2(Math.sin(diff), Math.cos(diff)) // 最短角へ
        headingRef.current += diff * TURN_LERP
      }
      playAction(walkName)
    } else if (!reduceMotion) {
      playAction(idleName)
    }

    group.rotation.y = headingRef.current
    positionRef.current.copy(group.position)
  })

  return (
    <group ref={groupRef} position={WORLD_LAYOUT.spawnPosition}>
      <primitive object={scene} scale={AVATAR_SCALE} />
    </group>
  )
}

useGLTF.preload(getTeamTWorldAssetUrl(WORLD_AVATAR_FILE))
