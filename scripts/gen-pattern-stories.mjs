// Reads a SelectionSpec and generates Storybook stories for every selected
// block item (components/patterns/<registryItem>.stories.tsx) and every
// screen composition (components/patterns/<screenPattern>-screen.stories.tsx),
// then writes the created story IDs back into each registry item's
// meta.aiDesignSystem.verification.storybookStories.
//
// Run: node scripts/gen-pattern-stories.mjs <selectionspec.json> [--force]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const PATTERNS_DIR = join(ROOT, 'components', 'patterns')

const args = process.argv.slice(2)
const specPath = args.find((a) => !a.startsWith('--'))
const force = args.includes('--force')

if (!specPath) {
  console.error('Usage: node scripts/gen-pattern-stories.mjs <selectionspec.json> [--force]')
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

// Same export-extraction approach as scripts/gen-atom-stories.mjs.
function extractPrimary(src, file) {
  const names = new Set()
  const blockRe = /export\s*\{([\s\S]*?)\}/g
  let m
  while ((m = blockRe.exec(src))) {
    for (const raw of m[1].split(',')) {
      const id = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
      if (id) names.add(id)
    }
  }
  const fnRe = /export\s+(?:function|const)\s+(\w+)/g
  while ((m = fnRe.exec(src))) names.add(m[1])
  const comps = [...names].filter(
    (n) => /^[A-Z]/.test(n) && !/Variants$/.test(n) && !/Style$/.test(n) && !/^type$/.test(n),
  )
  const norm = (s) => s.replace(/[^a-z0-9]/gi, '').toLowerCase()
  const base = norm(basename(file, '.tsx'))
  return comps.find((n) => norm(n) === base) || comps[0]
}

function titleToId(title) {
  const segs = title
    .split('/')
    .map((seg) =>
      seg
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
  return `${segs.join('-')}--default`
}

function todoComments(stateCoveragePlan, itemStateCoverage) {
  const covered = new Set(itemStateCoverage ?? [])
  return (stateCoveragePlan ?? [])
    .filter((s) => s !== 'default' && !covered.has(s))
    .map((s) => `// TODO state not implemented in inventory: ${s}`)
}

function storyFile({ title, imports, render, layout, todos }) {
  const todoBlock = todos.length ? `${todos.join('\n')}\n` : ''
  return `import type { Meta, StoryObj } from '@storybook/nextjs-vite'
${imports}

const meta = {
  title: '${title}',
  parameters: { layout: '${layout}' },
  tags: ['autodocs'],
  render: () => (
    ${render}
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

${todoBlock}export const Default: Story = {}
`
}

// Role-specific minimal wrapper/layout requirements.
const ROLE_CONFIG = {
  'app-shell-sidebar': { layout: 'fullscreen', wrapSidebar: true },
  'page-header-actions': { layout: 'fullscreen', wrapSidebar: true },
  'chart-panel': { layout: 'padded' },
  'data-table-panel': { layout: 'padded', needsData: true },
  'summary-metric-row': { layout: 'centered' },
  'form-section': { layout: 'centered' },
}

let created = 0
let skipped = 0
// name -> Set of story IDs to merge in; write-back is a surgical text patch of
// only the storybookStories array so the rest of the file's formatting (2-space
// indent, compact inline arrays) is preserved byte-for-byte.
const pendingStoryIds = new Map()

function loadItem(name) {
  const p = join(ROOT, 'registry', `${name}.json`)
  return { path: p, item: JSON.parse(readFileSync(p, 'utf8')) }
}

function writeStoryIdBack(name, item, storyId) {
  const existing = item.meta.aiDesignSystem.verification.storybookStories ?? []
  const ids = pendingStoryIds.get(name) ?? new Set(existing)
  ids.add(storyId)
  pendingStoryIds.set(name, ids)
}

function patchStorybookStories(rawText, ids) {
  const arrayLiteral = `[${[...ids].map((id) => JSON.stringify(id)).join(', ')}]`
  const pattern = /"storybookStories":\s*\[[^\]]*\]/
  if (!pattern.test(rawText)) {
    throw new Error('storybookStories field not found in expected single-line form')
  }
  return rawText.replace(pattern, `"storybookStories": ${arrayLiteral}`)
}

for (const screen of spec.screens ?? []) {
  for (const block of screen.blocks ?? []) {
    const name = block.registryItem
    const outPath = join(PATTERNS_DIR, `${name}.stories.tsx`)
    if (existsSync(outPath) && !force) {
      skipped++
      continue
    }
    const { path: itemPath, item } = loadItem(name)
    const facets = item.meta.aiDesignSystem
    const compFile = (item.files ?? []).find((f) => f.type === 'registry:component')
    if (!compFile) {
      console.error(`! ${name}: no registry:component file found, skipping`)
      skipped++
      continue
    }
    const src = readFileSync(join(ROOT, compFile.path), 'utf8')
    const primary = extractPrimary(src, compFile.path)
    if (!primary) {
      console.error(`! ${name}: no component export found in ${compFile.path}, skipping`)
      skipped++
      continue
    }
    const importPath = `@/${compFile.path.replace(/\.tsx$/, '')}`
    const config = ROLE_CONFIG[facets.blockRole] ?? { layout: 'padded' }
    const imports = [`import { ${primary} } from '${importPath}'`]
    let render
    if (config.wrapSidebar) {
      imports.push(`import { SidebarProvider } from '@/components/ui/sidebar'`)
      render = `<SidebarProvider><${primary} /></SidebarProvider>`
    } else if (config.needsData) {
      imports.push(`import data from '@/app/dashboard-01/data.json'`)
      render = `<${primary} data={data} />`
    } else {
      render = `<${primary} />`
    }
    const title = `Blocks/${facets.blockRole}/${item.title}`
    const todos = todoComments(screen.stateCoveragePlan, facets.stateCoverage)
    writeFileSync(
      outPath,
      storyFile({ title, imports: imports.join('\n'), render, layout: config.layout, todos }),
    )
    created++
    writeStoryIdBack(name, item, titleToId(title))
  }

  // Screen-level composition story: render the task-03 route page component.
  const screenName = screen.screenPattern?.registryItem
  if (screenName) {
    const outPath = join(PATTERNS_DIR, `${screenName}-screen.stories.tsx`)
    if (existsSync(outPath) && !force) {
      skipped++
    } else {
      const { path: itemPath, item } = loadItem(screenName)
      const facets = item.meta.aiDesignSystem
      const pagePath = `@/app/flows/${spec.flowId}/${screen.stepId}/page`
      const imports = [`import Screen from '${pagePath}'`]
      const render = `<Screen />`
      const title = `Patterns/${screen.resolvedScreenType}/${item.title}`
      const todos = todoComments(screen.stateCoveragePlan, facets.stateCoverage)
      writeFileSync(
        outPath,
        storyFile({ title, imports: imports.join('\n'), render, layout: 'fullscreen', todos }),
      )
      created++
      writeStoryIdBack(screenName, item, titleToId(title))
    }
  }
}

for (const [name, ids] of pendingStoryIds) {
  const p = join(ROOT, 'registry', `${name}.json`)
  const rawText = readFileSync(p, 'utf8')
  writeFileSync(p, patchStorybookStories(rawText, ids))
}

console.log(`Created ${created} story file(s), skipped ${skipped} (existing or unresolved).`)
console.log(`Updated verification.storybookStories on ${pendingStoryIds.size} registry item(s).`)
