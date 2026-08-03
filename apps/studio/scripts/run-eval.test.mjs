// Regression coverage for scripts/run-eval.mjs. Proves two things:
//   1. the frozen positive dataset (eval/cases) grades clean (exit 0), and
//   2. the intentional failing fixture is detected — non-zero exit AND the
//      failing case ID is named in the output.
// A passing run for the failing fixture is itself a test failure.
//
// Run: node scripts/run-eval.test.mjs  (or npm run test:eval)
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const FIXTURE = join(ROOT, 'eval', 'fixtures', 'failing-wrong-winner.json')

const run = (args) => spawnSync(process.execPath, ['scripts/run-eval.mjs', ...args], { cwd: ROOT, encoding: 'utf8' })

try {
  const pass = run([])
  if (pass.status !== 0) {
    throw new Error(`positive dataset: expected exit 0; got ${pass.status}: ${pass.stdout}${pass.stderr}`)
  }
  console.log('positive dataset: graded clean as expected')

  const fail = run([FIXTURE])
  const output = `${fail.stdout}${fail.stderr}`
  if (fail.status === 0) {
    throw new Error(`failing fixture: expected non-zero exit; got 0: ${output}`)
  }
  if (!output.includes('failing-wrong-winner')) {
    throw new Error(`failing fixture: output did not name the case ID 'failing-wrong-winner': ${output}`)
  }
  console.log('failing fixture: detected and named as expected (failing-wrong-winner)')
} catch (error) {
  console.error(`Eval runner regression test failed: ${error.message}`)
  process.exit(1)
}
