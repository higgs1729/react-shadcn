// Test for scripts/gen-flow-routes.mjs. Builds a self-contained temporary flow
// fixture (cloned from the validated studio-portfolio-01 SelectionSpec so it
// passes contract validation) and asserts:
//   1. a route page.tsx is produced for every RESOLVED step;
//   2. no route is produced for a step listed in `unresolved` (even when it also
//      appears in `screens`, exercising the exclusion filter);
//   3. regeneration is byte-for-byte idempotent (a second run changes nothing and
//      `--check` exits 0).
// The fixture SelectionSpec and its generated app/flows/<tmpId>/ tree are removed
// on exit, pass or fail, so the test leaves the repo untouched.
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { readDoc, docPath } from './lib/paths.mjs'

const ROOT = process.cwd()
const TMP_ID = `zztest-flow-routes-${process.pid}`
const specName = `selectionspec-${TMP_ID}.json`
// Write the fixture next to the real examples so readDoc resolves it by basename.
const specOut = join(ROOT, 'docs', 'examples', specName)
const flowDir = join(ROOT, 'app', 'flows', TMP_ID)

const failures = []
function check(label, cond) {
  if (!cond) failures.push(label)
}

function runGen(...extra) {
  return spawnSync('node', ['scripts/gen-flow-routes.mjs', TMP_ID, ...extra], {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
  })
}

function cleanup() {
  try {
    if (existsSync(specOut)) rmSync(specOut)
  } catch {}
  try {
    if (existsSync(flowDir)) rmSync(flowDir, { recursive: true, force: true })
  } catch {}
}

try {
  // Build the fixture from the validated studio spec so it is schema-valid.
  const studio = readDoc('selectionspec-studio-portfolio-01.json')
  const byId = new Map(studio.screens.map((s) => [s.stepId, s]))
  const overview = byId.get('overview')
  const patternLibrary = byId.get('pattern-library')
  const patternDetail = byId.get('pattern-detail')

  const fixture = {
    flowId: TMP_ID,
    // pattern-detail is intentionally BOTH a screen and unresolved: it must get
    // no route, proving the unresolved list wins over a stray screen entry.
    screens: [overview, patternLibrary, patternDetail],
    unresolved: [{ stepId: 'pattern-detail', reason: 'forced unresolved for test' }],
  }
  writeFileSync(specOut, JSON.stringify(fixture, null, 2))

  // First generation.
  const r1 = runGen()
  check(`generator exits 0 (got ${r1.status})\n${r1.stderr ?? ''}`, r1.status === 0)

  const overviewRoute = join(flowDir, 'overview', 'page.tsx')
  const libraryRoute = join(flowDir, 'pattern-library', 'page.tsx')
  const detailRoute = join(flowDir, 'pattern-detail', 'page.tsx')

  // (1) a route per resolved step.
  check('route produced for resolved step "overview"', existsSync(overviewRoute))
  check('route produced for resolved step "pattern-library"', existsSync(libraryRoute))
  // (2) none for the unresolved step.
  check('NO route produced for unresolved step "pattern-detail"', !existsSync(detailRoute))

  // Sanity: the generated multi-state route wraps the right screen with Suspense.
  if (existsSync(overviewRoute)) {
    const src = readFileSync(overviewRoute, 'utf8')
    check('overview route wires DashboardScreen', src.includes('DashboardScreen'))
    check('overview route uses a Suspense boundary', src.includes('React.Suspense'))
    check('overview route reads ?state= via useSearchParams', src.includes('useSearchParams'))
  }

  // (3) idempotence: capture bytes, regenerate, compare.
  const before = existsSync(overviewRoute) ? readFileSync(overviewRoute) : Buffer.alloc(0)
  const libBefore = existsSync(libraryRoute) ? readFileSync(libraryRoute) : Buffer.alloc(0)
  const r2 = runGen()
  check(`second generation exits 0 (got ${r2.status})`, r2.status === 0)
  const after = existsSync(overviewRoute) ? readFileSync(overviewRoute) : Buffer.alloc(1)
  const libAfter = existsSync(libraryRoute) ? readFileSync(libraryRoute) : Buffer.alloc(1)
  check('overview route byte-identical after regeneration', before.equals(after))
  check('pattern-library route byte-identical after regeneration', libBefore.equals(libAfter))

  const rc = runGen('--check')
  check(`--check reports no drift (exit 0, got ${rc.status})\n${rc.stderr ?? ''}`, rc.status === 0)
} finally {
  cleanup()
  // Guard against a leftover ambiguous basename tripping later readDoc calls.
  try {
    docPath(specName)
    failures.push(`fixture spec not cleaned up: ${specName}`)
  } catch {
    // expected: doc not found after cleanup.
  }
}

if (failures.length > 0) {
  console.error(`✗ gen-flow-routes test FAILED (${failures.length} assertion(s)):`)
  for (const f of failures) console.error(`    ${f}`)
  process.exit(1)
}
console.log('✓ gen-flow-routes: route-per-resolved-step, none-for-unresolved, idempotent.')
process.exit(0)
