"use client"

import * as React from "react"
import { Html, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import {
  getTeamTWorldAssetUrl,
  TEAM_T_WORLD_PALETTE,
  type TeamTWorldKiosk,
  WORLD_MACHINE_FILES,
} from "@/lib/team-t-app/world"

import { useTintedGltf, WORLD_COLORS } from "./team-t-world-materials"

const MACHINE_TINT = new THREE.Color("#d8c9f0")
const LABEL_HEIGHT = 3.5

export function TeamTWorldKioskMesh({
  kiosk,
  active,
  reduceMotion,
  onInteract,
}: {
  kiosk: TeamTWorldKiosk
  active: boolean
  reduceMotion: boolean
  onInteract: (index: number) => void
}) {
  const machine = useTintedGltf(kiosk.machineFile, MACHINE_TINT)
  const ringMatRef = React.useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const ring = ringMatRef.current
    if (!ring) return
    const pulse = reduceMotion ? 1 : 0.88 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12
    ring.color.copy(active ? WORLD_COLORS.goldBright : WORLD_COLORS.amethyst)
    ring.opacity = (active ? 0.72 : 0.24) * pulse
  })

  return (
    <group position={kiosk.position} rotation={[0, kiosk.rotationY, 0]}>
      <primitive object={machine} scale={kiosk.scale} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <ringGeometry
          args={[kiosk.collisionRadius * 0.72, kiosk.collisionRadius, 40]}
        />
        <meshBasicMaterial
          ref={ringMatRef}
          color={TEAM_T_WORLD_PALETTE.amethyst}
          transparent
          opacity={0.24}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {active ? (
        <Html
          position={[0, LABEL_HEIGHT, 0]}
          rotation={[0, -kiosk.rotationY, 0]}
          center
          distanceFactor={13}
          zIndexRange={[20, 0]}
        >
          <div className="pointer-events-auto w-56 -translate-y-2 rounded-xl border border-[#c7ab70] bg-[#0b0710]/94 px-4 py-3 text-center shadow-[0_0_28px_rgba(139,92,246,0.45)] backdrop-blur-sm">
            <p className="text-sm font-semibold tracking-wide text-[#f4e8d1]">
              {kiosk.game.title}
            </p>
            <p className="mt-1 text-xs text-[#b9b2a7]">
              コスト {kiosk.game.cost} / 最大 +{kiosk.game.maxReward}
            </p>
            <button
              type="button"
              className="mt-2 w-full rounded-lg border border-[#c7ab70] bg-[#4c2378] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.5)] transition-colors hover:bg-[#613392]"
              onClick={() => onInteract(kiosk.index)}
            >
              E で起動
            </button>
          </div>
        </Html>
      ) : null}
    </group>
  )
}

// 9台をワールドを開いた直後に並行取得する。
WORLD_MACHINE_FILES.forEach((file) => useGLTF.preload(getTeamTWorldAssetUrl(file)))
