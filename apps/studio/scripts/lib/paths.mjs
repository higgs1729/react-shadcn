// Location-independent doc resolution: files under docs/ are found by unique
// basename, so reorganizing folders never breaks scripts. A rename, a missing
// file, or a duplicated basename fails loudly instead of silently reading the
// wrong file.
import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const DOCS = join(process.cwd(), 'docs')

const index = new Map()
for (const rel of readdirSync(DOCS, { recursive: true }).map(String)) {
  if (!/\.(json|md)$/.test(rel)) continue
  // docs/archive/ holds superseded artifacts (completed briefs, old specs). It
  // is off-limits to agents (AGENTS.md) and must never be a resolution source:
  // indexing it would let a stale basename resolve silently, and a name shared
  // between a live file and its archived copy would make every consumer throw
  // "ambiguous" at startup. Skip it so live docs/ is the only resolution space.
  if (/^archive[\\/]/.test(rel)) continue
  const name = basename(rel)
  index.set(name, index.has(name) ? null : join(DOCS, rel))
}

/** Absolute path of a doc file, located by unique basename anywhere under docs/. */
export function docPath(name) {
  const p = index.get(name)
  if (p === undefined) throw new Error(`doc not found under docs/: ${name}`)
  if (p === null) throw new Error(`doc basename is ambiguous (exists in multiple folders): ${name}`)
  return p
}

/** Parsed JSON of a doc file located by basename. */
export function readDoc(name) {
  return JSON.parse(readFileSync(docPath(name), 'utf8'))
}
