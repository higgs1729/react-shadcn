// Runs every `test:*` script in this workspace's package.json and reports which
// ones failed. Exists so `npm run checks` has something to gate tests on: until
// this was added, all test:* scripts were reachable only by typing their exact
// name, so some of them sat broken without anyone noticing.
//
// The list is DISCOVERED from package.json, never hand-written here. A hand-kept
// array is the same failure mode one level up: a new test:* script gets added,
// nobody edits the array, and the test is silently ungated again.
//
// Failures are printed LAST and with short tails on purpose: run-checks.mjs keeps
// only the final 40 lines of this script's output when the `tests` check fails,
// so the diagnosis has to be at the bottom.
//
// Run: node scripts/run-tests.mjs [--only <name,name>]
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')

// The only exclusion is load-bearing: discovering ourselves would recurse.
const EXCLUDED = new Map([
  // Discovering ourselves would make `npm run test:all` spawn itself forever.
  ['test:all', 'self-reference'],
])

const args = process.argv.slice(2)
const onlyIdx = args.indexOf('--only')
const only = onlyIdx !== -1 ? args[onlyIdx + 1].split(',').map((s) => s.trim()) : null

const { scripts } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const discovered = Object.keys(scripts).filter((name) => name.startsWith('test:'))
const selected = discovered.filter((name) => !EXCLUDED.has(name) && (!only || only.includes(name)))

if (selected.length === 0) {
  console.error('run-tests: no test:* scripts selected — check the --only filter.')
  process.exit(1)
}

const skipped = discovered.filter((name) => EXCLUDED.has(name))
console.log(
  `run-tests: ${selected.length} of ${discovered.length} test:* script(s)` +
    (skipped.length > 0
      ? ` (skipping ${skipped.map((n) => `${n} — ${EXCLUDED.get(n)}`).join(', ')})`
      : ''),
)

const failures = []

for (const name of selected) {
  const result = spawnSync('npm', ['run', name], { cwd: ROOT, shell: true, encoding: 'utf8' })
  const passed = result.status === 0
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${name}`)
  if (!passed) {
    const tail = `${result.stdout ?? ''}${result.stderr ?? ''}`
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .slice(-12)
      .join('\n')
    failures.push({ name, tail })
  }
}

if (failures.length === 0) {
  console.log(`run-tests: OK — ${selected.length} test script(s) passed.`)
  process.exit(0)
}

console.error(`\nrun-tests: FAIL — ${failures.length} of ${selected.length} test script(s) failed:\n`)
for (const { name, tail } of failures) {
  console.error(`===== ${name} (last 12 lines) =====`)
  console.error(tail)
  console.error('')
}
console.error(`Reproduce a single one with: npm -w apps/studio run <name>`)
process.exit(1)
