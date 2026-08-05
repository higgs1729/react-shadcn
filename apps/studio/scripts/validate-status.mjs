// Cross-checks the two places this repository records "where we are now":
//   - the repo root AGENTS.md `## 移行状況` section (repo-wide)
//   - apps/studio/docs/STATUS.md (studio-scoped, read at every session start)
//
// Both files instruct their reader to keep themselves current, and both drifted
// anyway: AGENTS.md said Phase 3/4 were 完了 while STATUS.md still listed them
// under 着手予定の作業. A reader starting from STATUS.md would have re-done
// finished work. Prose asking for discipline did not prevent it, so this is the
// structural version of the same request.
//
// Deliberately narrow: it does NOT read git log and does NOT decide which file
// is right. Judging that would mean teaching a script to interpret commit
// history. It asserts only the one thing that cannot legitimately be true —
// that a phase is finished in one record and not-yet-started in the other —
// and leaves the resolution to whoever is editing.
//
// Run: node scripts/validate-status.mjs
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const STUDIO = resolve(import.meta.dirname, '..')
const REPO_ROOT = resolve(STUDIO, '..', '..')

const AGENTS_PATH = join(REPO_ROOT, 'AGENTS.md')
const STATUS_PATH = join(STUDIO, 'docs', 'STATUS.md')

function read(path) {
  return readFileSync(path, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n')
}

/** Body of a `## <heading>` section, up to the next `## ` or EOF. */
function section(text, heading) {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => line.startsWith('## ') && line.includes(heading))
  if (start === -1) return null
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((line) => line.startsWith('## '))
  return (end === -1 ? rest : rest.slice(0, end)).join('\n')
}

/** A top-level `- ` bullet plus its wrapped continuation lines. */
function bullet(sectionText, label) {
  const lines = sectionText.split('\n')
  const start = lines.findIndex((line) => line.startsWith(`- ${label}`))
  if (start === -1) return ''
  const out = [lines[start]]
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('- ') || line.startsWith('## ')) break
    out.push(line)
  }
  return out.join('\n')
}

/** Every phase number mentioned, expanding `Phase 4-5` into 4 and 5. */
function phasesIn(text) {
  const found = new Set()
  for (const m of text.matchAll(/Phase\s*(\d+)\s*(?:[-–—~]\s*(\d+))?/g)) {
    const from = Number(m[1])
    const to = m[2] ? Number(m[2]) : from
    for (let n = Math.min(from, to); n <= Math.max(from, to); n += 1) found.add(n)
  }
  return found
}

const intersect = (a, b) => [...a].filter((n) => b.has(n)).sort((x, y) => x - y)

for (const path of [AGENTS_PATH, STATUS_PATH]) {
  if (!existsSync(path)) {
    console.error(`Status cross-check failed: missing ${path}`)
    process.exit(1)
  }
}

const migration = section(read(AGENTS_PATH), '移行状況')
const status = read(STATUS_PATH)
const reached = section(status, '到達状態')
const planned = section(status, '着手予定')

// The migration record is expected to be deleted once the migration is over.
// Its absence is a finished migration, not a broken invariant.
if (migration === null) {
  console.log('Status cross-check skipped: AGENTS.md has no 移行状況 section (migration recorded as over).')
  process.exit(0)
}

if (reached === null || planned === null) {
  console.error('Status cross-check failed: STATUS.md must keep both a 到達状態 and a 着手予定 section.')
  process.exit(1)
}

const doneInAgents = phasesIn(bullet(migration, '完了'))
const openInAgents = phasesIn(bullet(migration, '未着手'))
const doneInStatus = phasesIn(reached)
const openInStatus = phasesIn(planned)

const errors = []

for (const n of intersect(doneInAgents, openInStatus)) {
  errors.push(`Phase ${n}: AGENTS.md の 移行状況 は「完了」、STATUS.md の 着手予定の作業 は未着手として掲載`)
}
for (const n of intersect(doneInStatus, openInAgents)) {
  errors.push(`Phase ${n}: STATUS.md の 到達状態 は「完了」、AGENTS.md の 移行状況 は「未着手」`)
}

if (errors.length > 0) {
  console.error('Status cross-check failed: 現在地の記録が2つ食い違っています。')
  console.error('正本は git log。両方を実態に合わせてから再実行してください。')
  console.error('')
  for (const err of errors) console.error(`- ${err}`)
  console.error('')
  console.error(`  AGENTS.md  完了=${[...doneInAgents].sort().join(',') || '-'}  未着手=${[...openInAgents].sort().join(',') || '-'}`)
  console.error(`  STATUS.md  到達=${[...doneInStatus].sort().join(',') || '-'}  着手予定=${[...openInStatus].sort().join(',') || '-'}`)
  process.exit(1)
}

console.log(
  `Status cross-check passed: Phase 完了=${[...doneInStatus].sort().join(',') || '-'} が両記録で矛盾なし。`,
)
