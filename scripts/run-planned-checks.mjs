// Executes every check a SelectionSpec plans for its screens (checksPlanned)
// against the check-ID -> command mapping in scripts/lib/check-registry.mjs,
// and emits results in the same machine-readable shape as run-checks.mjs.
// An unsupported/unmapped planned check ID is a failure, not a silent skip
// (see scripts/lib/check-registry.mjs UnsupportedCheckError).
//
// Run: node scripts/run-planned-checks.mjs [<selectionspec.json>] [--out <file.json>]
//   <selectionspec.json> - a file path, or a docs/ basename resolved via
//   scripts/lib/paths.mjs (readDoc's convention). Defaults to
//   "selectionspec-dryrun-02.json" (the current golden flow) when omitted.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { readDoc, docPath } from './lib/paths.mjs'
import { createContractAjv, getContractValidator, registerContractSchemas } from './lib/ajv.mjs'
import { resolveCheck, UnsupportedCheckError } from './lib/check-registry.mjs'

const args = process.argv.slice(2)
const outIdx = args.indexOf('--out')
const outPath = outIdx !== -1 ? args[outIdx + 1] : null
const specArg = args.find((a, i) => !a.startsWith('--') && (outIdx === -1 || i !== outIdx + 1))

const specPath = specArg
  ? existsSync(specArg)
    ? specArg
    : docPath(specArg)
  : docPath('selectionspec-dryrun-02.json')

const ajv = registerContractSchemas(createContractAjv())
const validateSelection = getContractValidator(ajv, 'ai-selectionspec.schema.json')

let spec
try {
  spec = JSON.parse(readFileSync(specPath, 'utf8'))
} catch (e) {
  console.error(`Invalid JSON: ${specPath} (${e.message})`)
  process.exit(1)
}

if (!validateSelection(spec)) {
  console.error(`✗ ${specPath}: INVALID SelectionSpec`)
  for (const err of validateSelection.errors) {
    console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
  }
  process.exit(1)
}

const results = []
const logs = {}
// Identical commands (lint/typecheck are whole-repo, same command for every
// screen that plans them) run once and their outcome is reused.
const commandCache = new Map()

for (const screen of spec.screens ?? []) {
  for (const checkId of screen.checksPlanned ?? []) {
    let check
    try {
      check = resolveCheck(checkId, screen)
    } catch (e) {
      const message = e instanceof UnsupportedCheckError ? e.message : `${e.message}`
      console.error(`✗ ${screen.stepId}:${checkId}: ${message}`)
      results.push({ stepId: screen.stepId, checkId, command: null, status: 'fail' })
      logs[`${screen.stepId}:${checkId}`] = message
      continue
    }

    let outcome = commandCache.get(check.command)
    if (!outcome) {
      const result = check.npxArgs
        ? spawnSync('npx', check.npxArgs, {
            shell: true,
            encoding: 'utf8',
            env: { ...process.env, ...check.env },
          })
        : spawnSync('npm', check.npmArgs, { shell: true, encoding: 'utf8' })
      const status = result.status === 0 ? 'pass' : 'fail'
      outcome = { status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
      commandCache.set(check.command, outcome)
    }

    results.push({ stepId: screen.stepId, checkId, command: check.command, status: outcome.status })
    if (outcome.status === 'fail') {
      logs[`${screen.stepId}:${checkId}`] = outcome.output.split(/\r?\n/).slice(-40).join('\n')
    }
  }
}

const passed = results.every((r) => r.status === 'pass')
const report = { specPath, checks: results, passed }
const reportJson = JSON.stringify(report, null, 2)
console.log(reportJson)

if (outPath) writeFileSync(outPath, reportJson)

if (Object.keys(logs).length > 0) {
  const logText = Object.entries(logs)
    .map(([name, text]) => `===== ${name} (last 40 lines) =====\n${text}`)
    .join('\n\n')
  if (outPath) {
    writeFileSync(`${outPath}.log.txt`, logText)
  } else {
    console.error(logText)
  }
}

process.exit(passed ? 0 : 1)
