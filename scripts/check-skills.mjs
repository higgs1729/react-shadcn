// Verify that every client-specific copy of the canonical project skill is
// byte-for-byte and structure-for-structure identical.
import { createHash } from "node:crypto"
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from "node:fs"
import { join, relative, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const ROOTS = [
  join(ROOT, ".agents", "skills", "shadcn"),
  join(ROOT, ".claude", "skills", "shadcn"),
  join(ROOT, ".hermes", "skills", "shadcn"),
]

function repoRelative(root, path) {
  return relative(root, path).replaceAll("\\", "/")
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function snapshot(root) {
  if (!existsSync(root)) throw new Error(`skill directory does not exist: ${root}`)

  const entries = new Map()
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name)
      const key = repoRelative(root, path)
      if (entry.isDirectory()) {
        entries.set(`${key}/`, "directory")
        visit(path)
      } else if (entry.isFile()) {
        entries.set(key, `file:${digest(path)}`)
      } else if (entry.isSymbolicLink()) {
        entries.set(key, `symlink:${readlinkSync(path)}`)
      } else {
        entries.set(key, `special:${lstatSync(path).mode}`)
      }
    }
  }
  visit(root)
  return entries
}

let snapshots
try {
  snapshots = ROOTS.map(snapshot)
} catch (error) {
  console.error(`skills:check: ${error.message}`)
  process.exit(1)
}

const allEntries = new Set(snapshots.flatMap((entries) => [...entries.keys()]))
const mismatches = []
for (const entry of [...allEntries].sort()) {
  const expected = snapshots[0].get(entry) ?? "<missing>"
  for (let index = 1; index < snapshots.length; index += 1) {
    const actual = snapshots[index].get(entry) ?? "<missing>"
    if (actual !== expected) {
      mismatches.push({ entry, expected, actual, target: ROOTS[index] })
    }
  }
}

if (mismatches.length > 0) {
  console.error("skills:check: FAILED — shadcn skill trees differ")
  for (const mismatch of mismatches) {
    console.error(
      `  ${mismatch.entry}: expected ${mismatch.expected}, got ${mismatch.actual} in ${mismatch.target}`,
    )
  }
  process.exit(1)
}

console.log(`skills:check: OK — ${ROOTS.length} identical trees, ${allEntries.size} entries`)
