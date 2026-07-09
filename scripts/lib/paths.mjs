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
