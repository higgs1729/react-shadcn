"use client"

import * as React from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js"

import type { TeamTWorldSkinId } from "@/lib/team-t-app/preferences"
import {
  getTeamTWorldAssetUrl,
  TEAM_T_WORLD_SKINS,
  WORLD_AVATAR_FILE,
} from "@/lib/team-t-app/world"

/** アバターとプレビューで同じスキン済みモデル・アニメーションを使う。 */
export function useTeamTWorldCharacter(skinId: TeamTWorldSkinId) {
  const url = getTeamTWorldAssetUrl(WORLD_AVATAR_FILE)
  const { scene, animations } = useGLTF(url)
  const skin =
    TEAM_T_WORLD_SKINS.find((candidate) => candidate.id === skinId) ??
    TEAM_T_WORLD_SKINS[0]
  const characterScene = React.useMemo(() => {
    const cloned = cloneSkeleton(scene)
    cloned.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      const skinnedMaterials = materials.map((material) => {
        const next = material.clone()
        if (next instanceof THREE.MeshStandardMaterial) {
          next.userData.teamTBaseColor = next.color.getHexString()
        }
        return next
      })
      mesh.material = Array.isArray(mesh.material)
        ? skinnedMaterials
        : skinnedMaterials[0]
    })
    return cloned
  }, [scene])

  React.useEffect(() => {
    const tint = new THREE.Color(skin.tint)
    const emissive = new THREE.Color(skin.emissive)
    characterScene.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return
        const baseColor = material.userData.teamTBaseColor
        if (typeof baseColor === "string") {
          material.color.set(`#${baseColor}`).multiply(tint)
        }
        material.emissive.copy(emissive)
        material.emissiveIntensity = 0.08
        material.needsUpdate = true
      })
    })
  }, [characterScene, skin.emissive, skin.tint])

  return { scene: characterScene, animations }
}

/** names の中から pattern 群に最初に一致するクリップ名を返す（無ければ先頭）。 */
export function pickTeamTWorldCharacterClip(
  names: string[],
  patterns: RegExp[]
): string | undefined {
  for (const pattern of patterns) {
    const hit = names.find((name) => pattern.test(name))
    if (hit) return hit
  }
  return names[0]
}

useGLTF.preload(getTeamTWorldAssetUrl(WORLD_AVATAR_FILE))
