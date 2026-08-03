"use client"

import * as React from "react"
import { useAnimations } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

import type { TeamTWorldSkinId } from "@/lib/team-t-app/preferences"
import { TEAM_T_WORLD_PALETTE } from "@/lib/team-t-app/world"

import {
  pickTeamTWorldCharacterClip,
  useTeamTWorldCharacter,
} from "./team-t-world-character"

export type TeamTWorldPreviewAnimation =
  "idle" | "walk" | "sprint" | "jump" | "nod"

const PREVIEW_CLIP_PATTERNS: Record<TeamTWorldPreviewAnimation, RegExp[]> = {
  idle: [/^idle$/i, /breath/i, /stand/i],
  walk: [/^walk$/i],
  sprint: [/^sprint$/i, /run/i],
  jump: [/^jump$/i],
  nod: [/^emote-yes$/i, /yes/i],
}

function PreviewCharacter({
  skinId,
  reduceMotion,
  animation,
}: {
  skinId: TeamTWorldSkinId
  reduceMotion: boolean
  animation: TeamTWorldPreviewAnimation
}) {
  const groupRef = React.useRef<THREE.Group>(null)
  const { scene, animations } = useTeamTWorldCharacter(skinId)
  const { actions, names } = useAnimations(animations, groupRef)
  const clipName = React.useMemo(
    () => pickTeamTWorldCharacterClip(names, PREVIEW_CLIP_PATTERNS[animation]),
    [animation, names]
  )

  React.useEffect(() => {
    const action = clipName ? actions[clipName] : undefined
    if (reduceMotion) {
      Object.values(actions).forEach((action) => action?.stop())
    } else {
      action?.reset().fadeIn(0.2).play()
    }
    return () => {
      action?.fadeOut(0.15)
      Object.values(actions).forEach((action) => action?.stop())
    }
  }, [actions, clipName, reduceMotion])

  return (
    <group ref={groupRef} position={[0, -0.65, 0]}>
      <primitive object={scene} scale={2.1} />
    </group>
  )
}

export function TeamTWorldSkinPreview({
  skinId,
  reduceMotion,
  animation,
}: {
  skinId: TeamTWorldSkinId
  reduceMotion: boolean
  animation: TeamTWorldPreviewAnimation
}) {
  return (
    <Canvas
      frameloop={reduceMotion ? "demand" : "always"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 6], fov: 34, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        gl.toneMappingExposure = 1.2
        camera.lookAt(0, 0.65, 0)
      }}
    >
      <color attach="background" args={["#090510"]} />
      <ambientLight intensity={0.9} color={TEAM_T_WORLD_PALETTE.ink} />
      <hemisphereLight
        intensity={0.85}
        color={TEAM_T_WORLD_PALETTE.amethyst}
        groundColor={TEAM_T_WORLD_PALETTE.void}
      />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.3}
        color={TEAM_T_WORLD_PALETTE.goldBright}
      />
      <pointLight
        position={[-3, 2, 2]}
        intensity={8}
        distance={8}
        color={TEAM_T_WORLD_PALETTE.magenta}
      />
      <React.Suspense fallback={null}>
        <PreviewCharacter
          skinId={skinId}
          reduceMotion={reduceMotion}
          animation={animation}
        />
      </React.Suspense>
    </Canvas>
  )
}
