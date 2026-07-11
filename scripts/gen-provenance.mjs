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
//   With any of --flow/--selection/--build/--out given, generates exactly one
//   manifest as today (inputs default to the golden dryrun-saas-ops-01
//   artifacts; --out defaults to the golden sidecar beside its BuildReport).
//   With none given, every flow triple discovered under docs/examples/ (see
//   scripts/lib/flows.mjs) gets its sidecar (re)generated as
//   docs/examples/buildreport-<flowId>.provenance.json; the CLI overrides
//   above (status/duration/failure/revision) do not apply in this bulk mode.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { createContractAjv } from './lib/ajv.mjs'
import { readDoc } from './lib/paths.mjs'
import { digestArtifact, digestRegistryInventory, resolveInput, findProhibitedKeys } from './lib/provenance.mjs'
import { discoverFlows, FlowDiscoveryError } from './lib/flows.mjs'

const ROOT = process.cwd()
const PROVENANCE_VERSION = '1.0.0'

const argv = process.argv.slice(2)
function opt(name, fallback) {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : fallback
}
const has = (name) => argv.includes(name)
const hasExplicitArgs = ['--flow', '--selection', '--build', '--out'].some((f) => argv.includes(f))

// BOM-tolerant, like scripts/validate-spec.mjs.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

const ajv = createContractAjv()
const validateManifest = ajv.compile(readDoc('ai-provenance.schema.json'))

/**
 * Build and write one provenance manifest.
 *   build            - the parsed BuildReport doc (anchor: flowId + terminal status)
 *   flowLabel/flowPath, selectionLabel/selectionPath, buildLabel/buildPath -
 *                      the recorded basename and resolved absolute path of each input
 *   registryDir, outPath - as documented above
 *   cli              - optional CLI overrides (status/durationMs/failure/revision),
 *                      only honored in explicit single-target mode
 */
function generateOne({ build, flowLabel, flowPath, selectionLabel, selectionPath, buildLabel, buildPath, registryDir, outPath, cli = {} }) {
  const status = cli.status ?? build.status
  const durationMs = cli.durationMs ?? 0
  let failure = null
  if (cli.failureClass) {
    failure = { classification: cli.failureClass, retryable: !!cli.retryable }
    if (cli.failureSummary) failure.summary = cli.failureSummary
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
      flowSpec: digestArtifact(flowLabel, flowPath),
      selectionSpec: digestArtifact(selectionLabel, selectionPath),
      buildReport: digestArtifact(buildLabel, buildPath),
      registryInventory: digestRegistryInventory(registryDir),
    },
    result: { status, durationMs: Number.isFinite(durationMs) ? durationMs : 0, failure },
  }

  if (cli.generatorRevision || cli.instructionRevision) {
    manifest.revision = {}
    if (cli.generatorRevision) manifest.revision.generator = cli.generatorRevision
    if (cli.instructionRevision) manifest.revision.instruction = cli.instructionRevision
  }

  const prohibited = findProhibitedKeys(manifest)
  if (prohibited.length > 0) {
    console.error(`✗ refusing to write manifest: prohibited key(s): ${prohibited.join(', ')}`)
    process.exit(1)
  }

  if (!validateManifest(manifest)) {
    console.error('✗ generated manifest is not schema-valid:')
    for (const err of validateManifest.errors) console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
    process.exit(1)
  }

  writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`✓ provenance written: ${outPath}`)
  console.log(`    flowId:   ${manifest.flowId}`)
  console.log(`    git:      ${manifest.git.commit}`)
  console.log(`    inputs:   flowSpec ${manifest.inputs.flowSpec.digest.slice(0, 12)}… / registry ${manifest.inputs.registryInventory.digest.slice(0, 12)}…`)
}

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

if (hasExplicitArgs) {
  const flowLabel = opt('--flow', 'flowspec-dryrun-saas-ops-01.json')
  const selectionLabel = opt('--selection', 'selectionspec-dryrun-saas-ops-01.json')
  const buildLabel = opt('--build', 'buildreport-dryrun-saas-ops-01.json')
  const flowPath = resolveInput(flowLabel)
  const selectionPath = resolveInput(selectionLabel)
  const buildPath = resolveInput(buildLabel)
  const registryDir = opt('--registry-dir', join(ROOT, 'registry'))
  const outPath = opt('--out', join(ROOT, 'docs', 'examples', 'buildreport-dryrun-saas-ops-01.provenance.json'))

  // BuildReport is the anchor: flowId and terminal status come from it.
  const build = readJson(buildPath)

  const failureClass = opt('--failure', null)
  generateOne({
    build,
    flowLabel: basename(flowLabel),
    flowPath,
    selectionLabel: basename(selectionLabel),
    selectionPath,
    buildLabel: basename(buildLabel),
    buildPath,
    registryDir,
    outPath,
    cli: {
      status: opt('--status', null),
      durationMs: Number.parseInt(opt('--duration-ms', '0'), 10),
      failureClass,
      retryable: has('--retryable'),
      failureSummary: opt('--failure-summary', null),
      generatorRevision: opt('--generator-revision', null),
      instructionRevision: opt('--instruction-revision', null),
    },
  })
} else {
  let discovered
  try {
    discovered = discoverFlows()
  } catch (e) {
    if (e instanceof FlowDiscoveryError) {
      console.error(`✗ flow discovery failed: ${e.message}`)
      process.exit(1)
    }
    throw e
  }
  if (discovered.length === 0) {
    console.error('✗ no flow triples discovered under docs/examples/')
    process.exit(1)
  }
  const registryDir = join(ROOT, 'registry')
  for (const flow of discovered) {
    const build = readJson(flow.buildReportPath)
    const outPath = join(ROOT, 'docs', 'examples', `buildreport-${flow.flowId}.provenance.json`)
    generateOne({
      build,
      flowLabel: basename(flow.flowSpecPath),
      flowPath: flow.flowSpecPath,
      selectionLabel: basename(flow.selectionSpecPath),
      selectionPath: flow.selectionSpecPath,
      buildLabel: basename(flow.buildReportPath),
      buildPath: flow.buildReportPath,
      registryDir,
      outPath,
    })
  }
}
