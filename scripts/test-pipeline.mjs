// Regression coverage for scripts/validate-pipeline.mjs. Each fixture is an
// otherwise schema-valid artifact that violates exactly one cross-document
// invariant; the pipeline validator must reject it non-zero and name the
// expected invariant. A passing (exit 0) run for any fixture is a test failure.
//
// Positive case first: the current golden triple must validate clean.
//
// Run: node scripts/test-pipeline.mjs  (or npm run test:pipeline)
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const EX = join(ROOT, 'docs', 'examples')
const FIX = join(ROOT, 'scripts', 'fixtures', 'pipeline')

const GOLDEN_FLOW = join(EX, 'flowspec-dryrun-saas-ops-01.json')
const GOLDEN_SELECTION = join(EX, 'selectionspec-dryrun-saas-ops-01.json')
const GOLDEN_BUILD = join(EX, 'buildreport-dryrun-saas-ops-01.json')

const run = ({ flow = GOLDEN_FLOW, selection = GOLDEN_SELECTION, build = GOLDEN_BUILD }) =>
  spawnSync(
    process.execPath,
    ['scripts/validate-pipeline.mjs', '--flow', flow, '--selection', selection, '--build', build],
    { cwd: ROOT, encoding: 'utf8' },
  )

function expectPass(label, paths) {
  const result = run(paths)
  const output = `${result.stdout}${result.stderr}`
  if (result.status !== 0) {
    throw new Error(`${label}: expected exit 0; got ${result.status}: ${output}`)
  }
  console.log(`${label}: validated as expected`)
}

function expectFailure(label, paths, invariant) {
  const result = run(paths)
  const output = `${result.stdout}${result.stderr}`
  if (result.status === 0 || !output.includes(invariant)) {
    throw new Error(`${label}: expected non-zero status and invariant ${invariant}; got ${result.status}: ${output}`)
  }
  console.log(`${label}: rejected as expected (${invariant})`)
}

try {
  expectPass('golden triple', {})

  expectFailure(
    'mismatched flowId',
    { selection: join(FIX, 'selection-mismatched-flowid.json') },
    'FLOW_ID_MATCH',
  )
  expectFailure(
    'missing step',
    { selection: join(FIX, 'selection-missing-step.json') },
    'STEP_COVERAGE',
  )
  expectFailure(
    'duplicate step',
    { selection: join(FIX, 'selection-duplicate-step.json') },
    'STEP_UNIQUE',
  )
  expectFailure(
    'unknown registry item',
    { selection: join(FIX, 'selection-unknown-registry.json') },
    'REGISTRY_ITEM_EXISTS',
  )
  expectFailure(
    'verified report with a failed check',
    { build: join(FIX, 'build-verified-failed-check.json') },
    'VERIFIED_CHECKS_PASS',
  )
} catch (error) {
  console.error(`Pipeline validator regression test failed: ${error.message}`)
  process.exit(1)
}
