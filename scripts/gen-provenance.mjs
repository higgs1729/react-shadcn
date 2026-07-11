// Deterministic, offline generator for a provenance sidecar manifest
// (docs/provenance/ai-provenance.schema.json). It records how a flow's
// BuildReport traces to its inputs and execution environment WITHOUT storing
// any secret, environment-variable value, raw prompt, user data, or model
// reasoning (see the privacy rule documented in the schema $comment).
//
// Run: node scripts/gen-provenance.mjs
//        [--flow <basename|path>] [--selection <basename|path>] [--build <basename|path>]
//        [--registry-dir <dir>] [--out <file>]
//        [--generator-revision <str>] [--instruction-revision <str>]
//        [--status verified|partial|failed] [--duration-ms <int>]
//        [--failure code|environment|dependency|policy] [--retryable]
//   Inputs default to the current golden artifacts; --out defaults to the golden
//   sidecar beside the BuildReport in docs/examples/.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { createContractAjv } from './lib/ajv.mjs'
import { readDoc } from './lib/paths.mjs'
import { digestArtifact, digestRegistryInventory, resolveInput, findProhibitedKeys } from './lib/provenance.mjs'

const ROOT = process.cwd()
const PROVENANCE_VERSION = '1.0.0'

const argv = process.argv.slice(2)
function opt(name, fallback) {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : fallback
}
const has = (name) => argv.includes(name)

const flowPath = resolveInput(opt('--flow', 'flowspec-dryrun-01.json'))
const selectionPath = resolveInput(opt('--selection', 'selectionspec-dryrun-02.json'))
const buildBasename = opt('--build', 'buildreport-dryrun-saas-ops-02.json')
const buildPath = resolveInput(buildBasename)
const registryDir = opt('--registry-dir', join(ROOT, 'registry'))
const outPath = opt('--out', join(ROOT, 'docs', 'examples', 'buildreport-dryrun-saas-ops-02.provenance.json'))

// BuildReport is the anchor: flowId and terminal status come from it.
const build = readDoc(buildBasename)

// --- git commit (never fail a local run over missing metadata) --------------
function gitCommit() {
  try {
    const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' })
    const sha = (r.stdout ?? '').trim()
    return r.status === 0 && /^[0-9a-f]{40}$/.test(sha) ? sha : 'unavailable'
  } catch {
    return 'unavailable'
  }
}

// --- npm version (offline, local binary) ------------------------------------
function npmVersion() {
  try {
    const r = spawnSync('npm', ['--version'], { cwd: ROOT, encoding: 'utf8', shell: true })
    const v = (r.stdout ?? '').trim()
    return r.status === 0 && v ? v : 'unavailable'
  } catch {
    return 'unavailable'
  }
}

// --- result / failure classification ----------------------------------------
const status = opt('--status', build.status)
const durationMs = Number.parseInt(opt('--duration-ms', '0'), 10)
const failureClass = opt('--failure', null)
let failure = null
if (failureClass) {
  failure = { classification: failureClass, retryable: has('--retryable') }
  const summary = opt('--failure-summary', null)
  if (summary) failure.summary = summary
}

const manifest = {
  provenanceVersion: PROVENANCE_VERSION,
  flowId: build.flowId,
  createdAt: new Date().toISOString(),
  git: { commit: gitCommit() },
  runtime: {
    node: process.version,
    npm: npmVersion(),
    os: `${os.type()} ${os.release()} ${os.arch()}`,
  },
  inputs: {
    flowSpec: digestArtifact('flowspec-dryrun-01.json', flowPath),
    selectionSpec: digestArtifact('selectionspec-dryrun-02.json', selectionPath),
    buildReport: digestArtifact(buildBasename, buildPath),
    registryInventory: digestRegistryInventory(registryDir),
  },
  result: { status, durationMs: Number.isFinite(durationMs) ? durationMs : 0, failure },
}

const generatorRevision = opt('--generator-revision', null)
const instructionRevision = opt('--instruction-revision', null)
if (generatorRevision || instructionRevision) {
  manifest.revision = {}
  if (generatorRevision) manifest.revision.generator = generatorRevision
  if (instructionRevision) manifest.revision.instruction = instructionRevision
}

// --- privacy guard: never emit a manifest carrying a prohibited key ---------
const prohibited = findProhibitedKeys(manifest)
if (prohibited.length > 0) {
  console.error(`✗ refusing to write manifest: prohibited key(s): ${prohibited.join(', ')}`)
  process.exit(1)
}

// --- schema gate: the generated manifest must be format-valid ---------------
const ajv = createContractAjv()
const validate = ajv.compile(readDoc('ai-provenance.schema.json'))
if (!validate(manifest)) {
  console.error('✗ generated manifest is not schema-valid:')
  for (const err of validate.errors) console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
  process.exit(1)
}

writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`✓ provenance written: ${outPath}`)
console.log(`    flowId:   ${manifest.flowId}`)
console.log(`    git:      ${manifest.git.commit}`)
console.log(`    inputs:   flowSpec ${manifest.inputs.flowSpec.digest.slice(0, 12)}… / registry ${manifest.inputs.registryInventory.digest.slice(0, 12)}…`)
