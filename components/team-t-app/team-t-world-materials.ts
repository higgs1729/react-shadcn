"use client"

import * as React from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

import {
  getTeamTWorldAssetUrl,
  TEAM_T_WORLD_PALETTE,
} from "@/lib/team-t-app/world"

/**
 * APIワールドの見た目の共有ロジック。
 *
 * Kenney の平坦パステルを電脳都市へ寄せる三段構えのうち「①色調」を担う。
 * 読み込んだ GLB のマテリアル color にダークな紫トーンを乗算する。
 * アトラスの UV(map)は触らないので絵柄は保たれ、全体だけが暗い紫へ寄る。
 */

/** マテリアル1枚を複製し、color に tint を乗算した複製を返す(元は汚さない)。 */
function tintMaterial(
  material: THREE.Material,
  tint: THREE.Color
): THREE.Material {
  const cloned = material.clone()
  const colored = cloned as THREE.Material & { color?: THREE.Color }
  if (colored.color instanceof THREE.Color) {
    colored.color.multiply(tint)
  }
  return cloned
}

/**
 * scene を(ジオメトリは共有したまま)複製し、全メッシュのマテリアルを
 * 複製して tint を乗算する。複数箇所へ同一 GLB を置いても互いに干渉しない。
 */
export function cloneTinted(
  source: THREE.Object3D,
  tint: THREE.Color
): THREE.Object3D {
  const clone = source.clone(true)
  clone.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => tintMaterial(m, tint))
      : tintMaterial(mesh.material, tint)
  })
  return clone
}

/** ダークな紫トーン。Kenney の彩度を落とし電脳都市の夜へ寄せる既定値。 */
export const WORLD_TINT = new THREE.Color("#6a5a8f")

/**
 * GLB を読み込み、tint を乗算した複製 Object3D を返す。
 * 複製は url+tint ごとに useMemo で一度だけ作る。
 */
export function useTintedGltf(
  fileName: string,
  tint: THREE.Color = WORLD_TINT
): THREE.Object3D {
  const url = getTeamTWorldAssetUrl(fileName)
  const { scene } = useGLTF(url)
  return React.useMemo(() => cloneTinted(scene, tint), [scene, tint])
}

/**
 * 手続き的ネオン板のマテリアル。PlaneGeometry へ貼り、加算合成で発光させる。
 * 黒は加算で消えるので抜き画像が不要(neon-tunnel.html が実証した方式)。
 */
export function createNeonMaterial(
  color: THREE.ColorRepresentation,
  opacity = 0.85
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
}

/** パレットを three の Color として引けるようにした版。 */
export const WORLD_COLORS = {
  void: new THREE.Color(TEAM_T_WORLD_PALETTE.void),
  ink: new THREE.Color(TEAM_T_WORLD_PALETTE.ink),
  amethyst: new THREE.Color(TEAM_T_WORLD_PALETTE.amethyst),
  magenta: new THREE.Color(TEAM_T_WORLD_PALETTE.magenta),
  violet: new THREE.Color(TEAM_T_WORLD_PALETTE.violet),
  gold: new THREE.Color(TEAM_T_WORLD_PALETTE.gold),
  goldBright: new THREE.Color(TEAM_T_WORLD_PALETTE.goldBright),
} as const
