// Stage external agent candidates in a temporary directory and pass them to
// the deterministic eval grader. This is intentionally a local adapter:
// it never starts an agent, calls a model, or changes the frozen eval cases.
//
// Run:
//   npm run eval:candidate -- --candidates <dir> [--dataset <dir-or-file>]
//
// Candidate contract:
//   <dir>/<case-id>.json
//
// The source directory is read-only from this script's perspective. Only
// top-level regular JSON files are copied to the temporary staging directory.
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, lstatSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'

const ROOT = process.cwd()

function parseArgs(argv) {
  const options = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg !== '--candidates' && arg !== '--dataset') {
      throw new Error(`unknown argument "${arg}" (expected --candidates <dir> [--dataset <path>])`)
    }
    const value = argv[i + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`${arg} requires a path`)
    }
    if (options[arg]) {
      throw new Error(`${arg} may be specified only once`)
    }
    options[arg] = value
    i += 1
  }
  if (!options['--candidates']) {
    throw new Error('missing required --candidates <dir>')
  }
  return options
}

function resolveInput(rawPath) {
  return isAbsolute(rawPath) ? rawPath : resolve(ROOT, rawPath)
}

function collectCandidateFiles(sourceDir) {
  const entries = readdirSync(sourceDir, { withFileTypes: true })
  if (entries.length === 0) {
    throw new Error(`candidate directory is empty: ${sourceDir}`)
  }

  const files = []
  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name)
    if (entry.isSymbolicLink() || !entry.isFile()) {
      throw new Error(`candidate directory must contain only top-level JSON files: ${sourcePath}`)
    }
    if (!entry.name.endsWith('.json')) {
      throw new Error(`candidate directory contains a non-JSON file: ${sourcePath}`)
    }
    files.push(sourcePath)
  }
  return files.sort()
}

function run() {
  const options = parseArgs(process.argv.slice(2))
  const sourceDir = resolveInput(options['--candidates'])
  const dataset = resolveInput(options['--dataset'] ?? join('eval', 'cases'))

  if (!existsSync(sourceDir) || !lstatSync(sourceDir).isDirectory()) {
    throw new Error(`candidate directory does not exist or is not a directory: ${sourceDir}`)
  }
  if (!existsSync(dataset)) {
    throw new Error(`dataset path does not exist: ${dataset}`)
  }

  const sourceFiles = collectCandidateFiles(sourceDir)
  const stagingDir = mkdtempSync(join(tmpdir(), 'react-shadcn-eval-candidates-'))
  try {
    for (const sourcePath of sourceFiles) {
      copyFileSync(sourcePath, join(stagingDir, sourcePath.split(/[\\/]/).pop()))
    }

    console.log(`eval:candidate: staged ${sourceFiles.length} candidate file(s) in a temporary directory`)
    const result = spawnSync(process.execPath, ['scripts/run-eval.mjs', dataset, '--candidates', stagingDir], {
      cwd: ROOT,
      stdio: 'inherit',
    })
    if (result.error) throw result.error
    process.exitCode = result.status ?? 1
  } finally {
    rmSync(stagingDir, { recursive: true, force: true })
  }
}

try {
  run()
} catch (error) {
  console.error(`eval:candidate: ${error.message}`)
  process.exitCode = 1
}
