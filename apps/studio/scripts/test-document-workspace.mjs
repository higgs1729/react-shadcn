// Regression coverage for document-workspace screenType.
// Validates that the new screenType enum value, canonical profile, and registry
// items satisfy the key invariants:
// - POSITIVE: screenType exists in schema enum, has an experimental profile,
//   all referenced blockRoles exist and have symmetric screenTypes references,
//   and registry has at least one screen-pattern item stocked with this type.
// - NEGATIVE: a SelectionSpec that resolves a step to screenType "document-workspace"
//   but points at a screen pattern whose facet screenType is NOT "document-workspace"
//   is rejected by validate-pipeline.mjs with SCREENTYPE_MATCH invariant.
//
// Run: node scripts/test-document-workspace.mjs (or npm run test:document-workspace)
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { readDoc, docPath } from './lib/paths.mjs'

const ROOT = process.cwd()
const TARGET_SCREEN_TYPE = 'document-workspace'
const REGISTRY_DIR = join(ROOT, 'registry')
const FIXTURES_DIR = join(ROOT, 'scripts', 'fixtures', 'pipeline')
const TEMP_SELECTION = join(FIXTURES_DIR, `temp-test-screentype-${TARGET_SCREEN_TYPE}.json`)

// Ensure fixtures directory exists
if (!existsSync(FIXTURES_DIR)) {
  mkdirSync(FIXTURES_DIR, { recursive: true })
}

/**
 * Spawn a validator script and return { status, stdout, stderr, output }
 */
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' })
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    output: `${result.stdout || ''}${result.stderr || ''}`,
  }
}

/**
 * Expect validate-pipeline to exit non-zero and contain the expected invariant.
 */
function expectPipelineFailure(label, tempSelectionPath, expectedInvariant) {
  const result = run([
    'scripts/validate-pipeline.mjs',
    '--flow', docPath('flowspec-dryrun-saas-ops-01.json'),
    '--selection', tempSelectionPath,
    '--build', docPath('buildreport-dryrun-saas-ops-01.json'),
  ])
  const output = result.output
  if (result.status === 0) {
    throw new Error(
      `${label}: expected non-zero status but got 0. Output: ${output}`,
    )
  }
  if (!output.includes(expectedInvariant)) {
    throw new Error(
      `${label}: expected invariant "${expectedInvariant}" but got: ${output}`,
    )
  }
  console.log(`${label}: rejected as expected (contains "${expectedInvariant}")`)
}

// ============================================================================
// BEGIN TESTS
// ============================================================================

try {
  // POSITIVE TEST 1: screenType enum contains TARGET_SCREEN_TYPE
  console.log(`\n[POSITIVE 1] Schema enum includes "${TARGET_SCREEN_TYPE}"`)
  const facetsSchema = readDoc('ai-design-facets.schema.json')
  const screenTypeEnum = facetsSchema.definitions?.screenType?.enum ?? []
  if (!screenTypeEnum.includes(TARGET_SCREEN_TYPE)) {
    throw new Error(
      `screenType enum missing "${TARGET_SCREEN_TYPE}". Available: ${screenTypeEnum.join(', ')}`,
    )
  }
  console.log(`✓ Found "${TARGET_SCREEN_TYPE}" in screenType enum (${screenTypeEnum.length} total)`)

  // POSITIVE TEST 2: Canonical profile exists for TARGET_SCREEN_TYPE with maturity "experimental"
  console.log(`\n[POSITIVE 2] Canonical profile exists for "${TARGET_SCREEN_TYPE}" with maturity "experimental"`)
  const profiles = readDoc('ai-canonical-profiles.json')
  const screenTypes = profiles.screenTypes ?? {}
  if (!(TARGET_SCREEN_TYPE in screenTypes)) {
    throw new Error(
      `screenTypes profile missing "${TARGET_SCREEN_TYPE}". Available: ${Object.keys(screenTypes).join(', ')}`,
    )
  }
  const screenProfile = screenTypes[TARGET_SCREEN_TYPE]
  if (screenProfile.maturity !== 'experimental') {
    throw new Error(
      `screenTypes[${TARGET_SCREEN_TYPE}].maturity is "${screenProfile.maturity}" (expected "experimental")`,
    )
  }
  console.log(`✓ Found screenTypes profile for "${TARGET_SCREEN_TYPE}" with maturity "experimental"`)
  console.log(`  typicalBlockRoles: ${(screenProfile.typicalBlockRoles ?? []).join(', ')}`)
  console.log(`  optionalBlockRoles: ${(screenProfile.optionalBlockRoles ?? []).join(', ')}`)

  // POSITIVE TEST 3: All referenced blockRoles exist in profiles.blockRoles
  console.log(`\n[POSITIVE 3] All referenced blockRoles exist in profiles.blockRoles`)
  const blockRoles = profiles.blockRoles ?? {}
  const blockRoleKeys = Object.keys(blockRoles)
  const typicalRoles = screenProfile.typicalBlockRoles ?? []
  const optionalRoles = screenProfile.optionalBlockRoles ?? []
  const allReferencedRoles = [...typicalRoles, ...optionalRoles]

  const missingRoles = allReferencedRoles.filter((role) => !blockRoleKeys.includes(role))
  if (missingRoles.length > 0) {
    throw new Error(
      `screenTypes[${TARGET_SCREEN_TYPE}] references undefined blockRoles: ${missingRoles.join(', ')}`,
    )
  }
  console.log(`✓ All ${allReferencedRoles.length} referenced blockRoles exist in profiles.blockRoles`)

  // POSITIVE TEST 4: screenType→blockRole symmetry (direction-2)
  // Every blockRole in the screen profile must have "${TARGET_SCREEN_TYPE}" in its screenTypes array
  console.log(`\n[POSITIVE 4] blockRole symmetry (all roles list "${TARGET_SCREEN_TYPE}" back)`)
  for (const role of allReferencedRoles) {
    const roleProfile = blockRoles[role]
    const roleScreenTypes = roleProfile.screenTypes ?? []
    if (!roleScreenTypes.includes(TARGET_SCREEN_TYPE)) {
      throw new Error(
        `screenTypes[${TARGET_SCREEN_TYPE}] lists blockRole "${role}" but "${role}" profile doesn't list "${TARGET_SCREEN_TYPE}" back`,
      )
    }
  }
  console.log(`✓ Symmetric: all ${allReferencedRoles.length} referenced blockRoles list "${TARGET_SCREEN_TYPE}" in their screenTypes`)

  // POSITIVE TEST 5: At least one screen-pattern registry item stocks this screenType
  console.log(`\n[POSITIVE 5] Registry has at least one screen-pattern item with screenType="${TARGET_SCREEN_TYPE}"`)
  const files = readdirSync(REGISTRY_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        const item = JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8'))
        return { f, item }
      } catch {
        return null
      }
    })
    .filter(Boolean)

  const stockedItems = files.filter(
    ({ item }) =>
      item?.meta?.aiDesignSystem?.assetKind === 'screen-pattern' &&
      item?.meta?.aiDesignSystem?.screenType === TARGET_SCREEN_TYPE,
  )

  if (stockedItems.length === 0) {
    throw new Error(
      `No screen-pattern registry items found with screenType="${TARGET_SCREEN_TYPE}". ` +
      `Note: if the registry item is still being created, this is expected until both delegates finish.`,
    )
  }
  console.log(`✓ Found ${stockedItems.length} screen-pattern item(s) with screenType="${TARGET_SCREEN_TYPE}":`)
  for (const { f } of stockedItems) {
    console.log(`  - ${f}`)
  }

  // ========================================================================
  // NEGATIVE TESTS: SCREENTYPE_MATCH cross-artifact invariant (RFC 009)
  // ========================================================================

  // NEGATIVE TEST 1: SCREENTYPE_MATCH violation
  // Create a SelectionSpec that resolves a step to screenType "document-workspace"
  // but points at a screen pattern with a different screenType (e.g., auth).
  console.log(`\n[NEGATIVE 1] SCREENTYPE_MATCH: reject resolvedScreenType mismatch`)

  if (existsSync(TEMP_SELECTION)) {
    throw new Error(`Refusing to overwrite existing temp file: ${TEMP_SELECTION}`)
  }

  try {
    // Load the golden selection spec
    const goldenSelection = readDoc('selectionspec-dryrun-saas-ops-01.json')

    // Deep clone it to avoid mutating the original
    const modifiedSelection = JSON.parse(JSON.stringify(goldenSelection))

    // Find the login screen (stepId: "login") and modify it to violate SCREENTYPE_MATCH:
    // Change resolvedScreenType to "document-workspace" while leaving screenPattern pointing
    // to "login-03" (which has screenType "auth" in its facets).
    const loginScreen = modifiedSelection.screens.find((s) => s.stepId === 'login')
    if (!loginScreen) {
      throw new Error('Golden selection spec missing login screen')
    }

    loginScreen.resolvedScreenType = TARGET_SCREEN_TYPE

    // Write the modified fixture to a temp file
    writeFileSync(TEMP_SELECTION, JSON.stringify(modifiedSelection, null, 2))

    // Expect validate-pipeline.mjs to reject it with SCREENTYPE_MATCH
    expectPipelineFailure(
      'SCREENTYPE_MATCH violation',
      TEMP_SELECTION,
      'SCREENTYPE_MATCH',
    )
  } finally {
    rmSync(TEMP_SELECTION, { force: true })
  }

  // All tests passed
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✓ All document-workspace regression tests passed (5 positive, 1 negative)`)
  console.log(`${'='.repeat(70)}`)
} catch (error) {
  console.error(`\n${'='.repeat(70)}`)
  console.error(`✗ document-workspace regression test failed: ${error.message}`)
  console.error(`${'='.repeat(70)}`)
  process.exit(1)
}
