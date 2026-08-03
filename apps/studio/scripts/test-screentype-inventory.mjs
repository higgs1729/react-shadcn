// Regression coverage for a screenType's inventory readiness.
// Parametrized by the screenType passed as argv[2] (e.g. `node scripts/test-screentype-inventory.mjs detail`).
// Validates the key invariants for the given screenType:
// - POSITIVE 1: screenType exists in the facets schema enum (derived dynamically).
// - POSITIVE 2: a canonical profile exists for the screenType.
// - POSITIVE 3: every blockRole referenced by the profile exists in profiles.blockRoles.
// - POSITIVE 4: screenType→blockRole symmetry (each referenced role lists the screenType back).
// - POSITIVE 5: at least one screen-pattern registry item is stocked with this screenType,
//   and every one of its requiredBlocks is stocked by a standalone block-pattern item.
// - NEGATIVE 1: a SelectionSpec that resolves a step to this screenType but points at a
//   screen pattern whose facet screenType differs is rejected by validate-pipeline (SCREENTYPE_MATCH).
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { readDoc, docPath } from './lib/paths.mjs'

const TARGET_SCREEN_TYPE = process.argv[2]
if (!TARGET_SCREEN_TYPE) {
  console.error('Usage: node scripts/test-screentype-inventory.mjs <screenType>')
  process.exit(2)
}

const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, 'registry')
const FIXTURES_DIR = join(ROOT, 'scripts', 'fixtures', 'pipeline')
const TEMP_SELECTION = join(FIXTURES_DIR, `temp-test-screentype-${TARGET_SCREEN_TYPE}.json`)

if (!existsSync(FIXTURES_DIR)) {
  mkdirSync(FIXTURES_DIR, { recursive: true })
}

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' })
  return {
    status: result.status,
    output: `${result.stdout || ''}${result.stderr || ''}`,
  }
}

function expectPipelineFailure(label, tempSelectionPath, expectedInvariant) {
  const result = run([
    'scripts/validate-pipeline.mjs',
    '--flow', docPath('flowspec-dryrun-saas-ops-01.json'),
    '--selection', tempSelectionPath,
    '--build', docPath('buildreport-dryrun-saas-ops-01.json'),
  ])
  if (result.status === 0) {
    throw new Error(`${label}: expected non-zero status but got 0. Output: ${result.output}`)
  }
  if (!result.output.includes(expectedInvariant)) {
    throw new Error(`${label}: expected invariant "${expectedInvariant}" but got: ${result.output}`)
  }
  console.log(`${label}: rejected as expected (contains "${expectedInvariant}")`)
}

try {
  // POSITIVE 1: screenType enum contains TARGET_SCREEN_TYPE
  console.log(`\n[POSITIVE 1] Schema enum includes "${TARGET_SCREEN_TYPE}"`)
  const facetsSchema = readDoc('ai-design-facets.schema.json')
  const screenTypeEnum = facetsSchema.definitions?.screenType?.enum ?? []
  if (!screenTypeEnum.includes(TARGET_SCREEN_TYPE)) {
    throw new Error(`screenType enum missing "${TARGET_SCREEN_TYPE}". Available: ${screenTypeEnum.join(', ')}`)
  }
  console.log(`✓ Found "${TARGET_SCREEN_TYPE}" in screenType enum (${screenTypeEnum.length} total)`)

  // POSITIVE 2: Canonical profile exists for TARGET_SCREEN_TYPE
  console.log(`\n[POSITIVE 2] Canonical profile exists for "${TARGET_SCREEN_TYPE}"`)
  const profiles = readDoc('ai-canonical-profiles.json')
  const screenTypes = profiles.screenTypes ?? {}
  if (!(TARGET_SCREEN_TYPE in screenTypes)) {
    throw new Error(`screenTypes profile missing "${TARGET_SCREEN_TYPE}". Available: ${Object.keys(screenTypes).join(', ')}`)
  }
  const screenProfile = screenTypes[TARGET_SCREEN_TYPE]
  console.log(`✓ Found screenTypes profile for "${TARGET_SCREEN_TYPE}" (maturity="${screenProfile.maturity}")`)

  // POSITIVE 3: All referenced blockRoles exist
  console.log(`\n[POSITIVE 3] All referenced blockRoles exist in profiles.blockRoles`)
  const blockRoles = profiles.blockRoles ?? {}
  const blockRoleKeys = Object.keys(blockRoles)
  const typicalRoles = screenProfile.typicalBlockRoles ?? []
  const optionalRoles = screenProfile.optionalBlockRoles ?? []
  const allReferencedRoles = [...typicalRoles, ...optionalRoles]
  const missingRoles = allReferencedRoles.filter((role) => !blockRoleKeys.includes(role))
  if (missingRoles.length > 0) {
    throw new Error(`screenTypes[${TARGET_SCREEN_TYPE}] references undefined blockRoles: ${missingRoles.join(', ')}`)
  }
  console.log(`✓ All ${allReferencedRoles.length} referenced blockRoles exist`)

  // POSITIVE 4: screenType→blockRole symmetry
  console.log(`\n[POSITIVE 4] blockRole symmetry (all roles list "${TARGET_SCREEN_TYPE}" back)`)
  for (const role of allReferencedRoles) {
    const roleScreenTypes = blockRoles[role].screenTypes ?? []
    if (!roleScreenTypes.includes(TARGET_SCREEN_TYPE)) {
      throw new Error(`screenTypes[${TARGET_SCREEN_TYPE}] lists blockRole "${role}" but "${role}" profile doesn't list "${TARGET_SCREEN_TYPE}" back`)
    }
  }
  console.log(`✓ Symmetric: all ${allReferencedRoles.length} referenced blockRoles list "${TARGET_SCREEN_TYPE}"`)

  // POSITIVE 5: At least one screen-pattern registry item stocks this screenType
  console.log(`\n[POSITIVE 5] Registry has a screen-pattern item with screenType="${TARGET_SCREEN_TYPE}"`)
  const items = readdirSync(REGISTRY_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return { f, item: JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8')) }
      } catch {
        return null
      }
    })
    .filter(Boolean)

  const stockedBlockRoles = new Set(
    items
      .map(({ item }) => item?.meta?.aiDesignSystem)
      .filter((m) => m?.assetKind === 'block-pattern' && m.blockRole)
      .map((m) => m.blockRole),
  )

  const stockedItems = items.filter(
    ({ item }) =>
      item?.meta?.aiDesignSystem?.assetKind === 'screen-pattern' &&
      item?.meta?.aiDesignSystem?.screenType === TARGET_SCREEN_TYPE,
  )
  if (stockedItems.length === 0) {
    throw new Error(`No screen-pattern registry items found with screenType="${TARGET_SCREEN_TYPE}".`)
  }
  for (const { f, item } of stockedItems) {
    const requiredBlocks = item.meta.aiDesignSystem.composition?.requiredBlocks ?? []
    const unstocked = requiredBlocks.filter((r) => !stockedBlockRoles.has(r))
    if (unstocked.length > 0) {
      throw new Error(`${f}: requiredBlocks not stocked as standalone block-pattern items: ${unstocked.join(', ')}`)
    }
  }
  console.log(`✓ Found ${stockedItems.length} screen-pattern item(s) with every requiredBlock stocked:`)
  for (const { f } of stockedItems) {
    console.log(`  - ${f}`)
  }

  // NEGATIVE 1: SCREENTYPE_MATCH violation
  console.log(`\n[NEGATIVE 1] SCREENTYPE_MATCH: reject resolvedScreenType mismatch`)
  if (existsSync(TEMP_SELECTION)) {
    throw new Error(`Refusing to overwrite existing temp file: ${TEMP_SELECTION}`)
  }
  try {
    const goldenSelection = readDoc('selectionspec-dryrun-saas-ops-01.json')
    const modifiedSelection = JSON.parse(JSON.stringify(goldenSelection))
    const loginScreen = modifiedSelection.screens.find((s) => s.stepId === 'login')
    if (!loginScreen) {
      throw new Error('Golden selection spec missing login screen')
    }
    // login-03 has screenType "auth"; forcing resolvedScreenType to TARGET must fail.
    loginScreen.resolvedScreenType = TARGET_SCREEN_TYPE
    writeFileSync(TEMP_SELECTION, JSON.stringify(modifiedSelection, null, 2))
    expectPipelineFailure('SCREENTYPE_MATCH violation', TEMP_SELECTION, 'SCREENTYPE_MATCH')
  } finally {
    rmSync(TEMP_SELECTION, { force: true })
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log(`✓ All ${TARGET_SCREEN_TYPE} inventory regression tests passed (5 positive, 1 negative)`)
  console.log(`${'='.repeat(70)}`)
} catch (error) {
  console.error(`\n${'='.repeat(70)}`)
  console.error(`✗ ${TARGET_SCREEN_TYPE} inventory regression test failed: ${error.message}`)
  console.error(`${'='.repeat(70)}`)
  process.exit(1)
}
