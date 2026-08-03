// Regression gate for the state capability declared by screen-pattern inventory.
// It deliberately has no generic state matrix: FlowSpec.requiredStates is the
// only requirement source. Run with `npm run test:screen-states`.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { docPath, readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, 'registry')
const STORY_DIR = join(ROOT, 'components', 'patterns')
const FIXTURES_DIR = join(ROOT, 'scripts', 'fixtures', 'pipeline')
const USER_OR_INTERACTION_STATES = new Set([
  'default',
  'loading',
  'empty',
  'error',
  'permission-denied',
  'validation-error',
  'disabled',
  'success',
])

function readRegistryItems() {
  return readdirSync(REGISTRY_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ file, item: JSON.parse(readFileSync(join(REGISTRY_DIR, file), 'utf8')) }))
}

function storyExportName(state) {
  return state
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function verifyNegativeFixture() {
  const result = spawnSync(
    process.execPath,
    [
      'scripts/validate-pipeline.mjs',
      '--flow', join(FIXTURES_DIR, 'flowspec-state-coverage-missing.json'),
      '--selection', docPath('selectionspec-dryrun-saas-ops-01.json'),
      '--build', docPath('buildreport-dryrun-saas-ops-01.json'),
    ],
    { cwd: ROOT, encoding: 'utf8' },
  )
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status === 0 || !output.includes('STATE_COVERAGE_MATCH') || !output.includes('loading')) {
    throw new Error(`negative FlowSpec/SelectionSpec fixture did not reject missing loading coverage: ${output}`)
  }
  console.log('Negative FlowSpec/SelectionSpec fixture: rejected missing loading coverage as expected.')
}

try {
  const facetsSchema = readDoc('ai-design-facets.schema.json')
  const legalStates = new Set(facetsSchema.definitions?.state?.enum ?? [])
  const profiles = readDoc('ai-canonical-profiles.json')
  const canonicalScreenTypes = Object.keys(profiles.screenTypes ?? {})
  const items = readRegistryItems()
  const screenPatterns = items.filter(({ item }) => item?.meta?.aiDesignSystem?.assetKind === 'screen-pattern')

  const stockedTypes = new Set(screenPatterns.map(({ item }) => item.meta.aiDesignSystem.screenType))
  const unstockedTypes = canonicalScreenTypes.filter((screenType) => !stockedTypes.has(screenType))
  if (unstockedTypes.length > 0) {
    throw new Error(`unstocked canonical screenTypes: ${unstockedTypes.join(', ')}`)
  }

  let verifiedStateStories = 0
  for (const { file, item } of screenPatterns) {
    const facets = item.meta.aiDesignSystem
    const declaredStates = facets.stateCoverage ?? []
    const illegalStates = declaredStates.filter((state) => !legalStates.has(state))
    if (illegalStates.length > 0) {
      throw new Error(`${file}: stateCoverage has illegal state(s): ${illegalStates.join(', ')}`)
    }

    const evidencedStates = declaredStates.filter((state) => USER_OR_INTERACTION_STATES.has(state))
    if (evidencedStates.length === 0) continue

    const storyPath = join(STORY_DIR, `${item.name}-screen.stories.tsx`)
    if (!existsSync(storyPath)) {
      throw new Error(`${file}: no screen Storybook file at ${storyPath}`)
    }
    const storySource = readFileSync(storyPath, 'utf8')
    const storyIds = new Set(facets.verification?.storybookStories ?? [])
    for (const state of evidencedStates) {
      const expectedId = `--${state}`
      const expectedExport = storyExportName(state)
      if (![...storyIds].some((storyId) => storyId.endsWith(expectedId))) {
        throw new Error(`${file}: stateCoverage "${state}" lacks a verification.storybookStories entry ending ${expectedId}`)
      }
      if (!new RegExp(`export const ${expectedExport}\\b`).test(storySource)) {
        throw new Error(`${file}: stateCoverage "${state}" lacks renderable Storybook export ${expectedExport}`)
      }
      verifiedStateStories++
    }
  }

  verifyNegativeFixture()
  console.log(
    `Screen state inventory passed: ${canonicalScreenTypes.length}/${canonicalScreenTypes.length} screenTypes stocked; ` +
      `${verifiedStateStories} declared user/interaction state stories verified.`,
  )
} catch (error) {
  console.error(`Screen state inventory regression failed: ${error.message}`)
  process.exit(1)
}
