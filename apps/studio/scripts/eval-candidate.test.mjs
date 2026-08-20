// Regression coverage for eval:candidate.mjs.
// It proves that external candidates are staged without changing the source
// directory, then graded through the existing positive and negative paths.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ROOT = process.cwd()
const CASES_DIR = join(ROOT, 'eval', 'cases')
const FIXTURE = join(ROOT, 'eval', 'fixtures', 'failing-wrong-winner.json')

function run(args) {
  return spawnSync(process.execPath, ['scripts/eval-candidate.mjs', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const candidateDir = mkdtempSync(join(tmpdir(), 'react-shadcn-eval-candidate-test-'))
try {
  const caseFiles = readdirSync(CASES_DIR).filter((file) => file.endsWith('.json')).sort()
  for (const file of caseFiles) {
    const testCase = JSON.parse(readFileSync(join(CASES_DIR, file), 'utf8'))
    writeFileSync(join(candidateDir, `${testCase.id}.json`), JSON.stringify(testCase.candidate, null, 2))
  }

  const pass = run(['--candidates', candidateDir])
  assert(pass.status === 0, `positive candidate directory failed: ${pass.stdout}${pass.stderr}`)
  assert(pass.stdout.includes('staged'), `positive run did not report staging: ${pass.stdout}`)
  console.log('positive candidate directory: staged and graded clean as expected')

  const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'))
  writeFileSync(join(candidateDir, 'clear-winner-collection.json'), JSON.stringify(fixture.candidate, null, 2))
  const fail = run(['--candidates', candidateDir])
  const output = `${fail.stdout}${fail.stderr}`
  assert(fail.status !== 0, `negative candidate directory unexpectedly passed: ${output}`)
  assert(output.includes('clear-winner-collection'), `negative run did not name the failing case: ${output}`)
  console.log('negative candidate directory: detected and named as expected')
} catch (error) {
  console.error(`eval:candidate regression test failed: ${error.message}`)
  process.exitCode = 1
} finally {
  rmSync(candidateDir, { recursive: true, force: true })
}
