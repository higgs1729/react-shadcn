// Regression coverage for document-body-editor blockRole.
// Validates that the new blockRole enum value, canonical profile, and registry
// items satisfy the key invariants:
// - POSITIVE: role exists in schema enum, has a canonical profile with valid
//   screenType references, symmetry is intact, and registry has at least one
//   block-pattern item stocked with this role.
// - NEGATIVE: invalid block-pattern facets (enum violation, missing required
//   fields, schema violations) are rejected by validate-facets.mjs.
//
// Run: node scripts/test-document-body-editor.mjs (or npm run test:document-body-editor)
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const TARGET_ROLE = 'document-body-editor'
const REGISTRY_DIR = join(ROOT, 'registry')
const TEMP_REGISTRY = join(REGISTRY_DIR, `temp-test-${TARGET_ROLE}.json`)

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
 * Expect a validate-facets run to exit non-zero and contain the expected error.
 */
function expectFailure(label, tempFile, expectedError) {
  const result = run(['scripts/validate-facets.mjs'])
  const output = result.output
  if (result.status === 0) {
    throw new Error(`${label}: expected non-zero status but got 0. Output: ${output}`)
  }
  if (!output.includes(expectedError)) {
    throw new Error(
      `${label}: expected error containing "${expectedError}" but got: ${output}`,
    )
  }
  console.log(`${label}: rejected as expected (contains "${expectedError}")`)
}

/**
 * Create a minimal block-pattern fixture in the registry and validate it fails.
 * The fixture is cleaned up in the finally block.
 */
function testInvalidBlockPattern(label, facets, expectedError) {
  if (existsSync(TEMP_REGISTRY)) {
    throw new Error(`Refusing to overwrite existing temp file: ${TEMP_REGISTRY}`)
  }

  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: `temp-test-${TARGET_ROLE}`,
    type: 'registry:block',
    title: 'Temp Test Document Body Editor',
    description: 'Temporary fixture for regression testing.',
    files: [{ path: 'temp.tsx', type: 'registry:component' }],
    meta: { aiDesignSystem: facets },
  }

  try {
    writeFileSync(TEMP_REGISTRY, JSON.stringify(item, null, 2))
    expectFailure(label, TEMP_REGISTRY, expectedError)
  } finally {
    rmSync(TEMP_REGISTRY, { force: true })
  }
}

// ============================================================================
// BEGIN TESTS
// ============================================================================

try {
  // POSITIVE TEST 1: blockRole enum contains TARGET_ROLE
  console.log(`\n[POSITIVE 1] Schema enum includes "${TARGET_ROLE}"`)
  const facetsSchema = readDoc('ai-design-facets.schema.json')
  const blockRoleEnum = facetsSchema.definitions?.blockRole?.enum ?? []
  if (!blockRoleEnum.includes(TARGET_ROLE)) {
    throw new Error(
      `blockRole enum missing "${TARGET_ROLE}". Available: ${blockRoleEnum.join(', ')}`,
    )
  }
  console.log(`✓ Found "${TARGET_ROLE}" in blockRole enum (${blockRoleEnum.length} total)`)

  // POSITIVE TEST 2: Canonical profile exists for TARGET_ROLE
  console.log(`\n[POSITIVE 2] Canonical profile exists for "${TARGET_ROLE}"`)
  const profiles = readDoc('ai-canonical-profiles.json')
  const blockRoles = profiles.blockRoles ?? {}
  if (!(TARGET_ROLE in blockRoles)) {
    throw new Error(
      `blockRoles profile missing "${TARGET_ROLE}". Available: ${Object.keys(blockRoles).join(', ')}`,
    )
  }
  const roleProfile = blockRoles[TARGET_ROLE]
  console.log(`✓ Found blockRoles profile for "${TARGET_ROLE}"`)
  console.log(`  maturity: ${roleProfile.maturity}, screenTypes: ${(roleProfile.screenTypes ?? []).join(', ')}`)

  // POSITIVE TEST 3: screenType references in role profile are valid
  console.log(`\n[POSITIVE 3] Role's screenType references are valid`)
  const screenTypes = profiles.screenTypes ?? {}
  const screenTypeKeys = Object.keys(screenTypes)
  const roleScreenTypes = roleProfile.screenTypes ?? []
  const invalidScreenTypes = roleScreenTypes.filter((s) => !screenTypeKeys.includes(s))
  if (invalidScreenTypes.length > 0) {
    throw new Error(
      `Role "${TARGET_ROLE}" references undefined screenTypes: ${invalidScreenTypes.join(', ')}`,
    )
  }
  console.log(
    `✓ All ${roleScreenTypes.length} screenType references valid: ${roleScreenTypes.join(', ')}`,
  )

  // POSITIVE TEST 4: screenType→blockRole symmetry (direction-2)
  console.log(`\n[POSITIVE 4] screenType symmetry (screenTypes that list this role have it in their profile)`)
  for (const screenType of roleScreenTypes) {
    const screenProfile = screenTypes[screenType]
    const typical = screenProfile.typicalBlockRoles ?? []
    const optional = screenProfile.optionalBlockRoles ?? []
    const shells = screenProfile.alternativeShells ?? []
    const allRoles = [...typical, ...optional, ...shells]
    if (!allRoles.includes(TARGET_ROLE)) {
      throw new Error(
        `Role "${TARGET_ROLE}" lists screenType "${screenType}" but "${screenType}" doesn't list "${TARGET_ROLE}" back`,
      )
    }
  }
  console.log(`✓ Symmetric: all ${roleScreenTypes.length} screenTypes list "${TARGET_ROLE}" in their profiles`)

  // POSITIVE TEST 5: At least one block-pattern registry item stocks this role
  console.log(`\n[POSITIVE 5] Registry has at least one block-pattern item with blockRole="${TARGET_ROLE}"`)
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
      item?.meta?.aiDesignSystem?.assetKind === 'block-pattern' &&
      item?.meta?.aiDesignSystem?.blockRole === TARGET_ROLE,
  )

  if (stockedItems.length === 0) {
    throw new Error(
      `No block-pattern registry items found with blockRole="${TARGET_ROLE}". ` +
      `Note: if the registry item is still being created, this is expected until both delegates finish.`,
    )
  }
  console.log(`✓ Found ${stockedItems.length} block-pattern item(s) with blockRole="${TARGET_ROLE}":`)
  for (const { f } of stockedItems) {
    console.log(`  - ${f}`)
  }

  // ========================================================================
  // NEGATIVE TESTS: invalid block-pattern fixtures
  // ========================================================================

  // NEGATIVE TEST 1: blockRole not in enum
  console.log(`\n[NEGATIVE 1] Reject blockRole not in enum`)
  testInvalidBlockPattern(
    'invalid enum',
    {
      assetKind: 'block-pattern',
      maturity: 'experimental',
      source: 'internal',
      blockRole: 'nonexistent-role',
      userIntents: ['create', 'edit'],
      dataShapes: ['document'],
      interactionModels: ['inline-edit'],
      evidence: { sourceCount: 1, confidence: 'low', verifiedAt: '2026-07-12' },
    },
    'nonexistent-role',
  )

  // NEGATIVE TEST 2: Missing required facet field (evidence)
  console.log(`\n[NEGATIVE 2] Reject missing required facet field`)
  testInvalidBlockPattern(
    'missing required field',
    {
      assetKind: 'block-pattern',
      maturity: 'experimental',
      source: 'internal',
      blockRole: TARGET_ROLE,
      userIntents: ['create', 'edit'],
      dataShapes: ['document'],
      interactionModels: ['inline-edit'],
      // evidence intentionally missing
    },
    'evidence',
  )

  // NEGATIVE TEST 3: blockRole references undefined in profiles
  console.log(`\n[NEGATIVE 3] Reject blockRole missing from canonical profiles`)
  testInvalidBlockPattern(
    'missing profile',
    {
      assetKind: 'block-pattern',
      maturity: 'experimental',
      source: 'internal',
      blockRole: 'undefined-role-xyz',
      userIntents: ['create', 'edit'],
      dataShapes: ['document'],
      interactionModels: ['inline-edit'],
      evidence: { sourceCount: 1, confidence: 'low', verifiedAt: '2026-07-12' },
    },
    'undefined-role-xyz',
  )

  // All tests passed
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✓ All document-body-editor regression tests passed (5 positive, 3 negative)`)
  console.log(`${'='.repeat(70)}`)
} catch (error) {
  console.error(`\n${'='.repeat(70)}`)
  console.error(`✗ document-body-editor regression test failed: ${error.message}`)
  console.error(`${'='.repeat(70)}`)
  process.exit(1)
}
