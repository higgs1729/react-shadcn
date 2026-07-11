// Regression coverage for scripts/run-planned-checks.mjs:
//   1. an unsupported planned check ID fails loudly (not silently skipped)
//      and names the offending ID;
//   2. every planned check in the golden dry-run SelectionSpec actually
//      executes a real command (pass/fail semantics belong to the checks
//      themselves - this only proves nothing was skipped or unmapped).
//
// Run: node scripts/run-planned-checks.test.mjs  (or npm run test:planned-checks)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readDoc, docPath } from './lib/paths.mjs'

test('an unsupported planned check ID fails loudly and names the ID', () => {
  const dir = mkdtempSync(join(tmpdir(), 'check-plan-'))
  try {
    const base = readDoc('selectionspec-dryrun-02.json')
    const fixture = {
      ...base,
      screens: [{ ...base.screens[0], checksPlanned: ['lint', 'visual-regression'] }],
    }
    const specPath = join(dir, 'fixture-unsupported-check.json')
    writeFileSync(specPath, JSON.stringify(fixture, null, 2))

    const result = spawnSync('node', ['scripts/run-planned-checks.mjs', specPath], { encoding: 'utf8' })

    assert.notEqual(result.status, 0, 'runner must exit non-zero for an unknown planned check')
    const output = `${result.stdout}${result.stderr}`
    assert.match(output, /visual-regression/, 'error must name the unsupported check id')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test(
  'every planned check in the golden dry-run SelectionSpec actually executes',
  { timeout: 300_000 },
  () => {
    const specPath = docPath('selectionspec-dryrun-02.json')
    const spec = JSON.parse(readFileSync(specPath, 'utf8'))
    const dir = mkdtempSync(join(tmpdir(), 'check-plan-'))
    try {
      const outPath = join(dir, 'report.json')
      spawnSync('node', ['scripts/run-planned-checks.mjs', specPath, '--out', outPath], { encoding: 'utf8' })

      const report = JSON.parse(readFileSync(outPath, 'utf8'))

      for (const screen of spec.screens) {
        for (const checkId of screen.checksPlanned) {
          const entry = report.checks.find((c) => c.stepId === screen.stepId && c.checkId === checkId)
          assert.ok(entry, `expected a result for ${screen.stepId}:${checkId}`)
          assert.ok(
            entry.command,
            `expected ${screen.stepId}:${checkId} to have run a real command, not be unsupported`,
          )
          assert.match(entry.status, /^(pass|fail)$/, `expected a pass/fail status for ${screen.stepId}:${checkId}`)
        }
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  },
)
