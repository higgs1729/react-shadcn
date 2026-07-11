// Regression coverage for scripts/validate-provenance.mjs. The provenance
// validator must accept the checked-in golden sidecar against its real source
// artifacts, and must reject the sidecar when ANY recorded input changes,
// naming the mismatched digest. A passing (exit 0) run for a mutated input is a
// test failure.
//
// The negative cases copy the golden sidecar + its inputs into a temp workspace,
// mutate exactly one copied input, and validate with --base-dir pointed there,
// so the checked-in artifacts are never touched.
//
// Run: node scripts/test-provenance.mjs  (or npm run test:provenance)
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const EX = join(ROOT, 'docs', 'examples')
const REG = join(ROOT, 'registry')
const MANIFEST = 'buildreport-dryrun-saas-ops-02.provenance.json'
const INPUTS = [
  'flowspec-dryrun-01.json',
  'selectionspec-dryrun-02.json',
  'buildreport-dryrun-saas-ops-02.json',
]

const run = (args) => spawnSync(process.execPath, ['scripts/validate-provenance.mjs', ...args], { cwd: ROOT, encoding: 'utf8' })

function expectPass(label, args) {
  const r = run(args)
  const out = `${r.stdout}${r.stderr}`
  if (r.status !== 0) throw new Error(`${label}: expected exit 0; got ${r.status}: ${out}`)
  console.log(`${label}: validated as expected`)
}

function expectFailure(label, args, needle) {
  const r = run(args)
  const out = `${r.stdout}${r.stderr}`
  if (r.status === 0 || !out.includes('DIGEST_MISMATCH') || !out.includes(needle)) {
    throw new Error(`${label}: expected non-zero + DIGEST_MISMATCH naming "${needle}"; got ${r.status}: ${out}`)
  }
  console.log(`${label}: rejected as expected (${needle})`)
}

/** Copy sidecar + inputs + registry into a fresh temp workspace. */
function stageWorkspace() {
  const dir = mkdtempSync(join(tmpdir(), 'provenance-'))
  cpSync(join(EX, MANIFEST), join(dir, MANIFEST))
  for (const f of INPUTS) cpSync(join(EX, f), join(dir, f))
  mkdirSync(join(dir, 'registry'))
  cpSync(REG, join(dir, 'registry'), { recursive: true })
  return dir
}

try {
  // Positive: golden sidecar against its real, unchanged inputs.
  expectPass('golden sidecar', [])

  // Positive: same manifest re-verified through a staged (unmodified) copy.
  const clean = stageWorkspace()
  try {
    expectPass('staged unchanged copy', ['--base-dir', clean, '--manifest', MANIFEST])
  } finally {
    rmSync(clean, { recursive: true, force: true })
  }

  // Negative: a changed BuildReport input is rejected, naming buildReport.
  const mutBuild = stageWorkspace()
  try {
    const p = join(mutBuild, 'buildreport-dryrun-saas-ops-02.json')
    const doc = JSON.parse(readFileSync(p, 'utf8'))
    doc.iterations = doc.iterations + 1 // real content change
    writeFileSync(p, JSON.stringify(doc, null, 2))
    expectFailure('mutated BuildReport', ['--base-dir', mutBuild, '--manifest', MANIFEST], 'buildReport')
  } finally {
    rmSync(mutBuild, { recursive: true, force: true })
  }

  // Negative: a changed registry item is rejected, naming registryInventory.
  const mutReg = stageWorkspace()
  try {
    const p = join(mutReg, 'registry', 'collection-table-01.json')
    const doc = JSON.parse(readFileSync(p, 'utf8'))
    doc.$comment = `${doc.$comment ?? ''} [mutated for test]`
    writeFileSync(p, JSON.stringify(doc, null, 2))
    expectFailure('mutated registry item', ['--base-dir', mutReg, '--manifest', MANIFEST], 'registryInventory')
  } finally {
    rmSync(mutReg, { recursive: true, force: true })
  }
} catch (error) {
  console.error(`Provenance validator regression test failed: ${error.message}`)
  process.exit(1)
}
console.log('All provenance regression cases passed.')
