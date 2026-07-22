"use client"

import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

import {
  TEAM_T_WORLD_PALETTE,
  teamTWorldKiosks,
  WORLD_LAYOUT,
} from "@/lib/team-t-app/world"
import type { TeamTWorldSkinId } from "@/lib/team-t-app/preferences"

import { TeamTWorldAvatar } from "./team-t-world-avatar"
import { useWorldControls } from "./team-t-world-controls"
import { TeamTWorldExitGate } from "./team-t-world-exit-gate"
import { TeamTWorldKioskMesh } from "./team-t-world-kiosk"
import { TeamTWorldRoom } from "./team-t-world-room"

const CAMERA_OFFSET = new THREE.Vector3(0, 7.5, 10.5)

/** アバターを追うカメラ。reduceMotion 時はラグ(lerp)とスウェイを切る。 */
function CameraRig({
  positionRef,
  reduceMotion,
}: {
  positionRef: React.RefObject<THREE.Vector3>
  reduceMotion: boolean
}) {
  const desired = React.useRef(new THREE.Vector3())
  const lookAt = React.useRef(new THREE.Vector3())

  useFrame((state) => {
    const target = positionRef.current
    desired.current.copy(target).add(CAMERA_OFFSET)
    if (!reduceMotion) {
      const sway = Math.sin(state.clock.elapsedTime * 0.4) * 0.6
      desired.current.x += sway
    }
    if (reduceMotion) {
      state.camera.position.copy(desired.current)
    } else {
      state.camera.position.lerp(desired.current, 0.08)
    }
    lookAt.current.set(target.x, target.y + 1.6, target.z)
    state.camera.lookAt(lookAt.current)
  })

  return null
}

/** 毎フレーム最寄りの筐体を判定し、変化時だけ通知する。 */
function ProximityProbe({
  positionRef,
  onActive,
  onExitActive,
}: {
  positionRef: React.RefObject<THREE.Vector3>
  onActive: (index: number | null) => void
  onExitActive: (active: boolean) => void
}) {
  useFrame(() => {
    const p = positionRef.current
    let best: number | null = null
    let bestDist = Infinity
    for (const kiosk of teamTWorldKiosks) {
      const dx = p.x - kiosk.position[0]
      const dz = p.z - kiosk.position[2]
      const dist = Math.hypot(dx, dz)
      const threshold = WORLD_LAYOUT.interactDistance + kiosk.collisionRadius
      if (dist < threshold && dist < bestDist) {
        best = kiosk.index
        bestDist = dist
      }
    }
    onActive(best)

    const exitX = p.x - WORLD_LAYOUT.exitPosition[0]
    const exitZ = p.z - WORLD_LAYOUT.exitPosition[2]
    onExitActive(Math.hypot(exitX, exitZ) < WORLD_LAYOUT.exitInteractDistance)
  })
  return null
}

export function TeamTWorldCanvas({
  reduceMotion,
  controlsEnabled,
  paused,
  onActiveKioskChange,
  onExitActiveChange,
  onInteract,
  onExit,
  onReady,
  skinId,
}: {
  reduceMotion: boolean
  controlsEnabled: boolean
  paused: boolean
  onActiveKioskChange?: (index: number | null) => void
  onExitActiveChange?: (active: boolean) => void
  onInteract: (index: number) => void
  onExit: () => void
  onReady?: () => void
  skinId: TeamTWorldSkinId
}) {
  const positionRef = React.useRef(
    new THREE.Vector3(...WORLD_LAYOUT.spawnPosition)
  )
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const activeIndexRef = React.useRef<number | null>(null)
  const [exitActive, setExitActive] = React.useState(false)
  const exitActiveRef = React.useRef(false)

  const handleActive = React.useCallback(
    (index: number | null) => {
      if (activeIndexRef.current === index) return
      activeIndexRef.current = index
      setActiveIndex(index)
      onActiveKioskChange?.(index)
    },
    [onActiveKioskChange]
  )

  const handleInteract = React.useCallback(() => {
    if (exitActiveRef.current) {
      onExit()
      return
    }
    if (activeIndexRef.current != null) onInteract(activeIndexRef.current)
  }, [onExit, onInteract])

  const handleExitActive = React.useCallback(
    (active: boolean) => {
      if (exitActiveRef.current === active) return
      exitActiveRef.current = active
      setExitActive(active)
      onExitActiveChange?.(active)
    },
    [onExitActiveChange]
  )

  const controlsRef = useWorldControls(controlsEnabled, handleInteract)

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 7.5, 18.5], fov: 50, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.12
        onReady?.()
      }}
    >
      <color attach="background" args={[TEAM_T_WORLD_PALETTE.void]} />
      <fogExp2 attach="fog" args={[TEAM_T_WORLD_PALETTE.void, 0.013]} />

      <ambientLight intensity={0.62} color={TEAM_T_WORLD_PALETTE.ink} />
      <hemisphereLight
        intensity={0.55}
        color={TEAM_T_WORLD_PALETTE.amethyst}
        groundColor={TEAM_T_WORLD_PALETTE.void}
      />
      <directionalLight
        position={[8, 14, 10]}
        intensity={0.82}
        color={TEAM_T_WORLD_PALETTE.gold}
      />

      <React.Suspense fallback={null}>
        <TeamTWorldRoom />
        <TeamTWorldExitGate
          active={exitActive}
          reduceMotion={reduceMotion}
          onExit={onExit}
        />
        {teamTWorldKiosks.map((kiosk) => (
          <TeamTWorldKioskMesh
            key={kiosk.index}
            kiosk={kiosk}
            active={activeIndex === kiosk.index}
            reduceMotion={reduceMotion}
            onInteract={onInteract}
          />
        ))}
        <TeamTWorldAvatar
          controlsRef={controlsRef}
          positionRef={positionRef}
          reduceMotion={reduceMotion}
          skinId={skinId}
        />
      </React.Suspense>

      <CameraRig positionRef={positionRef} reduceMotion={reduceMotion} />
      <ProximityProbe
        positionRef={positionRef}
        onActive={handleActive}
        onExitActive={handleExitActive}
      />
    </Canvas>
  )
}
