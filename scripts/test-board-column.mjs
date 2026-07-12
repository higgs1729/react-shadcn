import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { readDoc } from './lib/paths.mjs'

const role = 'board-column'
const registryDir = join(process.cwd(), 'registry')
const temporary = join(registryDir, 'temp-test-board-column.json')
const schema = readDoc('ai-design-facets.schema.json')
const profiles = readDoc('ai-canonical-profiles.json')

if (!schema.definitions.blockRole.enum.includes(role)) throw new Error('board-column missing from blockRole enum')
if (!profiles.blockRoles[role]) throw new Error('board-column missing canonical profile')
const stocked = readdirSync(registryDir).some((name) => {
  const item = JSON.parse(readFileSync(join(registryDir, name), 'utf8'))
  return item.meta?.aiDesignSystem?.assetKind === 'block-pattern' && item.meta.aiDesignSystem?.blockRole === role
})
if (!stocked) throw new Error('board-column has no standalone block-pattern inventory')

if (existsSync(temporary)) throw new Error(`Refusing to overwrite ${temporary}`)
try {
  writeFileSync(temporary, JSON.stringify({
    name: 'temp-test-board-column', type: 'registry:block', files: [],
    meta: { aiDesignSystem: { assetKind: 'block-pattern', maturity: 'experimental', source: 'internal', blockRole: 'not-a-board-role', evidence: { sourceCount: 0, confidence: 'low', verifiedAt: '2026-07-12' } } },
  }))
  const result = spawnSync(process.execPath, ['scripts/validate-facets.mjs'], { encoding: 'utf8' })
  if (result.status === 0 || !`${result.stdout}${result.stderr}`.includes('not-a-board-role')) throw new Error('invalid blockRole fixture was accepted')
} finally {
  rmSync(temporary, { force: true })
}
console.log('board-column regression: enum, profile, inventory, and invalid facet rejection passed.')
