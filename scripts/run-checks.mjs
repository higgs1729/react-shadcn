// Pure reporter: runs the fixed five-check verification suite and emits results
// in the exact shape of the BuildReport `checks[]` array. Never fixes anything
// itself — fixing under the fix-loop policy is the executor's job.
//
// Run: node scripts/run-checks.mjs [--out <file.json>] [--only <name,name>]
import { writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const CHECKS = [
  { name: 'contracts', script: 'validate' },
  { name: 'lint', script: 'lint' },
  { name: 'typecheck', script: 'typecheck' },
  { name: 'build', script: 'build' },
  { name: 'storybook', script: 'build-storybook' },
]

const args = process.argv.slice(2)
const outIdx = args.indexOf('--out')
const outPath = outIdx !== -1 ? args[outIdx + 1] : null
const onlyIdx = args.indexOf('--only')
const only = onlyIdx !== -1 ? args[onlyIdx + 1].split(',').map((s) => s.trim()) : null

const selected = only ? CHECKS.filter((c) => only.includes(c.name)) : CHECKS
const typecheckSelected = selected.some((c) => c.name === 'typecheck')

let typecheckFailed = false
const results = []
const logs = {}

for (const check of selected) {
  const command = `npm run ${check.script}`
  if (typecheckSelected && typecheckFailed && (check.name === 'build' || check.name === 'storybook')) {
    results.push({ name: check.name, command: `${command} (skipped)`, status: 'fail' })
    continue
  }
  const result = spawnSync('npm', ['run', check.script], { shell: true, encoding: 'utf8' })
  const status = result.status === 0 ? 'pass' : 'fail'
  results.push({ name: check.name, command, status })
  if (status === 'fail') {
    const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`
    logs[check.name] = combined.split(/\r?\n/).slice(-40).join('\n')
    if (check.name === 'typecheck') typecheckFailed = true
  }
}

const passed = results.every((r) => r.status === 'pass')
const report = { checks: results, passed }
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
