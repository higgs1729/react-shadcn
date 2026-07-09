// Reads a SelectionSpec, resolves every selected registry item's dependencies,
// installs whatever is missing, and emits a machine-readable install report.
// No AI judgment at runtime: it either finds everything it needs or exits
// non-zero with a precise error.
//
// Run: node scripts/install-selection.mjs <selectionspec.json> [--dry-run] [--out <report.json>]
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const specPath = args.find((a) => !a.startsWith('--'))
const dryRun = args.includes('--dry-run')
const outIdx = args.indexOf('--out')
const outPath = outIdx !== -1 ? args[outIdx + 1] : null

if (!specPath) {
  console.error('Usage: node scripts/install-selection.mjs <selectionspec.json> [--dry-run] [--out <report.json>]')
  process.exit(1)
}

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false })
addFormats(ajv)
ajv.addSchema(readDoc('ai-design-facets.schema.json'))
const validateSelection = ajv.compile(readDoc('ai-selectionspec.schema.json'))

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

// Step 3: collect the selected item set from resolved screens only.
const itemNames = new Set()
for (const screen of spec.screens ?? []) {
  if (screen.screenPattern?.registryItem) itemNames.add(screen.screenPattern.registryItem)
  for (const b of screen.blocks ?? []) {
    if (b.registryItem) itemNames.add(b.registryItem)
  }
}

// Step 4-5: load each item, verify its file payload exists on disk.
const items = []
const missingFiles = []
for (const name of itemNames) {
  const itemPath = join(ROOT, 'registry', `${name}.json`)
  if (!existsSync(itemPath)) {
    console.error(`Registry item not found: ${name} (expected registry/${name}.json)`)
    process.exit(1)
  }
  const item = JSON.parse(readFileSync(itemPath, 'utf8'))
  items.push(item)
  for (const f of item.files ?? []) {
    const filePath = join(ROOT, f.path)
    if (!existsSync(filePath)) missingFiles.push(`${name}: ${f.path}`)
  }
}

if (missingFiles.length > 0) {
  console.error('Missing files declared by selected registry items:')
  for (const m of missingFiles) console.error(`    ${m}`)
  process.exit(1)
}

// Step 6: resolve shadcn primitives.
const shadcnDeps = new Set()
for (const item of items) {
  for (const dep of item.registryDependencies ?? []) shadcnDeps.add(dep)
}
const shadcnPresent = []
const shadcnMissing = []
for (const dep of shadcnDeps) {
  const compPath = join(ROOT, 'components', 'ui', `${dep}.tsx`)
  if (existsSync(compPath)) shadcnPresent.push(dep)
  else shadcnMissing.push(dep)
}

const shadcnInstalled = []
for (const dep of shadcnMissing) {
  if (dryRun) continue
  const result = spawnSync('npx', ['shadcn@latest', 'add', dep, '--yes'], {
    shell: true,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    console.error(`Failed to install shadcn dependency: ${dep}`)
    process.exit(1)
  }
  shadcnInstalled.push(dep)
}

// Step 7: resolve npm dependencies.
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const knownNpm = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
])
const npmDeps = new Set()
for (const item of items) {
  for (const dep of item.meta?.aiDesignSystem?.dependencies?.npm ?? []) npmDeps.add(dep)
}
const npmPresent = []
const npmMissing = []
for (const dep of npmDeps) {
  if (knownNpm.has(dep)) npmPresent.push(dep)
  else npmMissing.push(dep)
}

const npmInstalled = []
if (npmMissing.length > 0 && !dryRun) {
  const result = spawnSync('npm', ['install', ...npmMissing], { shell: true, stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`Failed to install npm dependencies: ${npmMissing.join(', ')}`)
    process.exit(1)
  }
  npmInstalled.push(...npmMissing)
}

// Step 9: emit report.
const report = {
  selectionSpec: specPath,
  items: [...itemNames],
  shadcn: {
    present: shadcnPresent,
    installed: dryRun ? [] : shadcnInstalled,
  },
  npm: {
    present: npmPresent,
    installed: dryRun ? [] : npmInstalled,
  },
  missingFiles: [],
  dryRun,
}

if (dryRun) {
  report.shadcn.pending = shadcnMissing
  report.npm.pending = npmMissing
}

const reportJson = JSON.stringify(report, null, 2)
console.log(reportJson)
if (outPath) writeFileSync(outPath, reportJson)
