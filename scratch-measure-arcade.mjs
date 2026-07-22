import { readFileSync } from "node:fs"

const DIR = "C:/Users/tomoy/AppData/Local/Temp/kenney4/ex_arcade/Models/GLB format"

function readGlbJson(path) {
  const buf = readFileSync(path)
  const jsonLen = buf.readUInt32LE(12)
  return JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"))
}
function nodeScale(node) {
  if (node.matrix) {
    const m = node.matrix
    return [
      Math.hypot(m[0], m[1], m[2]),
      Math.hypot(m[4], m[5], m[6]),
      Math.hypot(m[8], m[9], m[10]),
    ]
  }
  return node.scale ?? [1, 1, 1]
}
function nodeTrans(node) {
  if (node.matrix) return [node.matrix[12], node.matrix[13], node.matrix[14]]
  return node.translation ?? [0, 0, 0]
}

const files = [
  "floor",
  "wall",
  "wall-corner",
  "wall-door-rotate",
  "wall-window",
  "column",
  "arcade-machine",
  "pinball",
  "air-hockey",
  "basketball-game",
  "claw-machine",
  "dance-machine",
  "gambling-machine",
  "prize-wheel",
  "vending-machine",
  "ticket-machine",
  "character-gamer",
]

for (const f of files) {
  const j = readGlbJson(`${DIR}/${f}.glb`)
  const acc = j.accessors ?? []
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const node of j.nodes ?? []) {
    if (node.mesh == null) continue
    const s = nodeScale(node)
    const t = nodeTrans(node)
    for (const prim of j.meshes[node.mesh].primitives ?? []) {
      const p = prim.attributes?.POSITION
      if (p == null) continue
      const a = acc[p]
      if (!a?.min || !a?.max) continue
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], a.min[i] * s[i] + t[i], a.max[i] * s[i] + t[i])
        max[i] = Math.max(max[i], a.min[i] * s[i] + t[i], a.max[i] * s[i] + t[i])
      }
    }
  }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  console.log(
    `${f.padEnd(18)} size ${size.map((v) => v.toFixed(2)).join(" × ")}   y[${min[1].toFixed(2)}..${max[1].toFixed(2)}]`
  )
}
