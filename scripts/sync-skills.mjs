// Distribute the canonical project skills to each client-specific loader.
// Run explicitly after changing .agents/skills/shadcn; CI should use
// check-skills.mjs so it never mutates the working tree.
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const SOURCE = join(ROOT, ".agents", "skills", "shadcn")
const TARGETS = [
  join(ROOT, ".claude", "skills", "shadcn"),
  join(ROOT, ".hermes", "skills", "shadcn"),
]

if (!existsSync(SOURCE)) {
  console.error(`skills:sync: canonical source does not exist: ${SOURCE}`)
  process.exit(1)
}

for (const target of TARGETS) {
  const parent = dirname(target)
  const suffix = `${process.pid}-${Date.now()}`
  const staging = join(parent, `.shadcn-skill-staging-${suffix}`)
  const backup = join(parent, `.shadcn-skill-backup-${suffix}`)

  mkdirSync(parent, { recursive: true })
  cpSync(SOURCE, staging, { recursive: true, force: true })

  // Swap directories only after the complete copy succeeds. If the swap
  // fails, restore the original target instead of leaving a partial tree.
  let movedTarget = false
  try {
    if (existsSync(target)) {
      renameSync(target, backup)
      movedTarget = true
    }
    renameSync(staging, target)
    if (movedTarget) rmSync(backup, { recursive: true, force: true })
  } catch (error) {
    if (existsSync(target)) rmSync(target, { recursive: true, force: true })
    if (movedTarget && existsSync(backup)) renameSync(backup, target)
    throw error
  } finally {
    if (existsSync(staging)) rmSync(staging, { recursive: true, force: true })
  }

  console.log(`skills:sync: ${target}`)
}

console.log("skills:sync: canonical shadcn skill distributed to all targets")
