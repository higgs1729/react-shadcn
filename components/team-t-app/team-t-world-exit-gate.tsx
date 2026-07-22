"use client"

import * as React from "react"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { TEAM_T_WORLD_PALETTE, WORLD_LAYOUT } from "@/lib/team-t-app/world"

export function TeamTWorldExitGate({
  active,
  reduceMotion,
  onExit,
}: {
  active: boolean
  reduceMotion: boolean
  onExit: () => void
}) {
  const groupRef = React.useRef<THREE.Group>(null)
  const coreRef = React.useRef<THREE.MeshBasicMaterial>(null)
  const ringRef = React.useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const group = groupRef.current
    const core = coreRef.current
    const ring = ringRef.current
    if (!group || !core || !ring) return

    const pulse = reduceMotion
      ? 1
      : 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.06
    group.scale.setScalar(active ? pulse * 1.08 : pulse)
    core.opacity = active ? 0.5 : 0.3
    if (!reduceMotion) ring.rotation.z = state.clock.elapsedTime * 0.45
  })

  return (
    <group
      ref={groupRef}
      position={WORLD_LAYOUT.exitPosition}
      onClick={(event) => {
        event.stopPropagation()
        onExit()
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[1.65, 48]} />
        <meshBasicMaterial
          ref={coreRef}
          color={TEAM_T_WORLD_PALETTE.violet}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <torusGeometry args={[1.68, 0.11, 12, 56]} />
        <meshBasicMaterial
          color={
            active
              ? TEAM_T_WORLD_PALETTE.goldBright
              : TEAM_T_WORLD_PALETTE.amethyst
          }
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.95}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.11, 0]}
      >
        <ringGeometry args={[1.05, 1.28, 40, 1, 0.35, Math.PI * 1.55]} />
        <meshBasicMaterial
          color={TEAM_T_WORLD_PALETTE.magenta}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.72}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        position={[0, 0.8, 0]}
        color={
          active
            ? TEAM_T_WORLD_PALETTE.goldBright
            : TEAM_T_WORLD_PALETTE.amethyst
        }
        intensity={active ? 8 : 4}
        distance={5}
      />

      <Html
        position={[0, 1.05, 0]}
        center
        distanceFactor={11}
        occlude
        zIndexRange={[3, 0]}
      >
        <button
          type="button"
          onClick={onExit}
          className={`pointer-events-auto rounded-full border px-4 py-2 text-xs font-bold tracking-wide whitespace-nowrap backdrop-blur-sm transition-colors ${
            active
              ? "border-[#ffe6a8] bg-[#3b225b]/95 text-white shadow-[0_0_24px_rgba(216,75,255,0.65)]"
              : "border-[#9b6cff]/70 bg-[#0b0710]/85 text-[#d8cfc0]"
          }`}
        >
          {active ? "E でアーケードを出る" : "帰還ゲート"}
        </button>
      </Html>
    </group>
  )
}
