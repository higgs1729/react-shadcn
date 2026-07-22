"use client"

import * as React from "react"
import { useAnimations } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import type { TeamTWorldSkinId } from "@/lib/team-t-app/preferences"
import { teamTWorldKiosks, WORLD_LAYOUT } from "@/lib/team-t-app/world"

import {
  pickTeamTWorldCharacterClip,
  useTeamTWorldCharacter,
} from "./team-t-world-character"
import type { WorldControlState } from "./team-t-world-controls"

const MOVE_SPEED = 6.5 // units / sec
const SPRINT_MULTIPLIER = 1.7
const JUMP_VELOCITY = 8.2
const GRAVITY = 21
const TURN_LERP = 0.18
const AVATAR_SCALE = 2.4

export function TeamTWorldAvatar({
  controlsRef,
  positionRef,
  reduceMotion,
  skinId,
}: {
  controlsRef: React.RefObject<WorldControlState>
  /** アバターのワールド座標を毎フレーム書き込む共有 ref(カメラ・近接判定が読む)。 */
  positionRef: React.RefObject<THREE.Vector3>
  reduceMotion: boolean
  skinId: TeamTWorldSkinId
}) {
  const groupRef = React.useRef<THREE.Group>(null)
  const { scene: avatarScene, animations } = useTeamTWorldCharacter(skinId)
  const { actions, names } = useAnimations(animations, groupRef)

  const idleName = React.useMemo(
    () => pickTeamTWorldCharacterClip(names, [/idle/i, /breath/i, /stand/i]),
    [names]
  )
  const walkName = React.useMemo(
    () => pickTeamTWorldCharacterClip(names, [/^walk$/i, /walk/i]),
    [names]
  )
  const sprintName = React.useMemo(
    () => pickTeamTWorldCharacterClip(names, [/^sprint$/i, /run/i]),
    [names]
  )
  const jumpName = React.useMemo(
    () => pickTeamTWorldCharacterClip(names, [/^jump$/i]),
    [names]
  )
  const nodName = React.useMemo(
    () => pickTeamTWorldCharacterClip(names, [/^emote-yes$/i, /yes/i]),
    [names]
  )
  const currentActionRef = React.useRef<string | null>(null)
  const headingRef = React.useRef(0)
  const jumpVelocityRef = React.useRef(0)
  const jumpingRef = React.useRef(false)
  const gestureRemainingRef = React.useRef(0)

  const playAction = React.useCallback(
    (name: string | undefined, once = false) => {
      if (!name || currentActionRef.current === name) return
      const next = actions[name]
      if (!next) return
      const prev = currentActionRef.current
        ? actions[currentActionRef.current]
        : null
      prev?.fadeOut(0.2)
      next.reset()
      next.setLoop(
        once ? THREE.LoopOnce : THREE.LoopRepeat,
        once ? 1 : Infinity
      )
      next.fadeIn(0.2).play()
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

    if (controls.jumpRequested) {
      controls.jumpRequested = false
      if (!jumpingRef.current) {
        jumpingRef.current = true
        jumpVelocityRef.current = JUMP_VELOCITY
        gestureRemainingRef.current = 0
        playAction(jumpName, true)
      }
    }

    if (controls.nodRequested) {
      controls.nodRequested = false
      if (!jumpingRef.current && nodName) {
        const nodClip = animations.find((clip) => clip.name === nodName)
        gestureRemainingRef.current = nodClip?.duration ?? 1
        playAction(nodName, true)
      }
    }

    if (jumpingRef.current) {
      jumpVelocityRef.current -= GRAVITY * delta
      group.position.y += jumpVelocityRef.current * delta
      if (group.position.y <= 0) {
        group.position.y = 0
        jumpVelocityRef.current = 0
        jumpingRef.current = false
        currentActionRef.current = null
      }
    } else if (gestureRemainingRef.current > 0) {
      gestureRemainingRef.current = Math.max(
        0,
        gestureRemainingRef.current - delta
      )
      if (gestureRemainingRef.current === 0) currentActionRef.current = null
    }

    let moveX = (controls.right ? 1 : 0) - (controls.left ? 1 : 0)
    let moveZ = (controls.back ? 1 : 0) - (controls.forward ? 1 : 0)
    const moving = moveX !== 0 || moveZ !== 0

    if (moving) {
      const length = Math.hypot(moveX, moveZ)
      moveX /= length
      moveZ /= length

      const speed = MOVE_SPEED * (controls.sprint ? SPRINT_MULTIPLIER : 1)
      const candidate = new THREE.Vector3(
        group.position.x + moveX * speed * delta,
        0,
        group.position.z + moveZ * speed * delta
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
      if (!jumpingRef.current && gestureRemainingRef.current === 0) {
        playAction(controls.sprint ? sprintName : walkName)
      }
    } else if (
      !reduceMotion &&
      !jumpingRef.current &&
      gestureRemainingRef.current === 0
    ) {
      playAction(idleName)
    }

    group.rotation.y = headingRef.current
    positionRef.current.copy(group.position)
  })

  return (
    <group ref={groupRef} position={WORLD_LAYOUT.spawnPosition}>
      <primitive object={avatarScene} scale={AVATAR_SCALE} />
    </group>
  )
}
