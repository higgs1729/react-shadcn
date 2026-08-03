// Lightweight regression coverage for scripts/report-inventory-coverage.mjs.
// The report is observability-only (task-15 brief: "always exit 0, never
// fail on gaps"), so this test only asserts the contract that actually
// matters for an observability tool: it runs cleanly and its output names
// every canonical screenType and blockRole (so a reader can tell a real gap
// from an entry the report silently forgot to print).
//
// Run: node scripts/report-inventory-coverage.test.mjs (or npm run test:coverage)
import { spawnSync } from 'node:child_process'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()

const result = spawnSync(process.execPath, ['scripts/report-inventory-coverage.mjs'], {
  cwd: ROOT,
  encoding: 'utf8',
})
const output = `${result.stdout}${result.stderr}`

const failures = []

if (result.status !== 0) {
  failures.push(`expected exit 0; got ${result.status}: ${output}`)
}

const profiles = readDoc('ai-canonical-profiles.json')
const screenTypes = Object.keys(profiles.screenTypes ?? {})
const blockRoles = Object.keys(profiles.blockRoles ?? {})

if (screenTypes.length === 0 || blockRoles.length === 0) {
  failures.push(`canonical profiles unexpectedly empty (screenTypes=${screenTypes.length}, blockRoles=${blockRoles.length})`)
}

for (const s of screenTypes) {
  if (!output.includes(s)) failures.push(`output is missing canonical screenType "${s}"`)
}
for (const r of blockRoles) {
  if (!output.includes(r)) failures.push(`output is missing canonical blockRole "${r}"`)
}

if (failures.length > 0) {
  console.error(`Inventory coverage report regression test failed (${failures.length}):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `Inventory coverage report regression test passed: exit 0, all ${screenTypes.length} screenTypes and ${blockRoles.length} blockRoles named.`,
)
