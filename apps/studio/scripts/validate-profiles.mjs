// Validates docs/ai-canonical-profiles.json against its contract:
//  1. JSON Schema validation (ajv) against ai-canonical-profiles.schema.json,
//     with facet enums resolved from ai-design-facets.schema.json.
//  2. Referential checks the schema cannot express:
//     - every role in typicalBlockRoles / optionalBlockRoles / alternativeShells
//       exists as a blockRoles entry
//     - every screenType in a blockRole's screenTypes exists as a screenTypes entry
//     - direction-1 symmetry: S lists R (typical/optional/shell) -> R.screenTypes contains S
//     - typical and optional are disjoint
// Run: npm run validate:profiles  (exit 1 on any failure)
import { readDoc } from './lib/paths.mjs'
import { createContractAjv, getContractValidator, registerContractSchemas } from './lib/ajv.mjs'

const profiles = readDoc('ai-canonical-profiles.json')

const errors = []

// 1. Schema validation
// validateSchema: false — both schema files declare the draft-07 meta-schema with
// an https:// URL, which ajv only registers under http://; skip meta validation.
const ajv = registerContractSchemas(createContractAjv())
const validate = getContractValidator(ajv, 'ai-canonical-profiles.schema.json')
if (!validate(profiles)) {
  for (const e of validate.errors) {
    errors.push(`schema: ${e.instancePath || '/'} ${e.message}`)
  }
}

// 2. Referential checks
const screenTypeKeys = new Set(Object.keys(profiles.screenTypes ?? {}))
const blockRoleKeys = new Set(Object.keys(profiles.blockRoles ?? {}))

for (const [s, prof] of Object.entries(profiles.screenTypes ?? {})) {
  const typical = prof.typicalBlockRoles ?? []
  const optional = prof.optionalBlockRoles ?? []
  const shells = prof.alternativeShells ?? []
  for (const r of [...typical, ...optional, ...shells]) {
    if (!blockRoleKeys.has(r)) {
      errors.push(`ref: screenTypes.${s} references undefined blockRole "${r}"`)
    } else if (!(profiles.blockRoles[r].screenTypes ?? []).includes(s)) {
      errors.push(`symmetry: screenTypes.${s} lists "${r}" but blockRoles.${r}.screenTypes lacks "${s}"`)
    }
  }
  const overlap = typical.filter((r) => optional.includes(r))
  if (overlap.length > 0) {
    errors.push(`overlap: screenTypes.${s} has roles in both typical and optional: ${overlap.join(', ')}`)
  }
}

for (const [r, prof] of Object.entries(profiles.blockRoles ?? {})) {
  for (const s of prof.screenTypes ?? []) {
    if (!screenTypeKeys.has(s)) {
      errors.push(`ref: blockRoles.${r} references undefined screenType "${s}"`)
    }
  }
}

if (errors.length > 0) {
  console.error(`ai-canonical-profiles.json: ${errors.length} problem(s)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(
  `ai-canonical-profiles.json: OK (${screenTypeKeys.size} screenTypes, ${blockRoleKeys.size} blockRoles, schema + referential checks passed)`,
)
