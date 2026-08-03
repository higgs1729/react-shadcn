// Offline self-validation for every immutable JSON Schema contract.
// Optional paths make malformed-schema regression fixtures testable too.
import { readFileSync } from 'node:fs'
import {
  CONTRACT_SCHEMA_FILES,
  createContractAjv,
  getContractValidator,
  registerContractSchemas,
} from './lib/ajv.mjs'

try {
  const ajv = createContractAjv()
  const targets = process.argv.slice(2)
  if (targets.length === 0) {
    registerContractSchemas(ajv)
    for (const file of CONTRACT_SCHEMA_FILES) {
      getContractValidator(ajv, file)
      console.log(`${file}: valid schema`)
    }
  } else {
    for (const file of targets) {
      const schema = JSON.parse(readFileSync(file, 'utf8'))
      ajv.addSchema(schema)
      // addSchema validates the meta-schema; getSchema also compiles and
      // resolves every reference so dangling local/remote references fail.
      ajv.getSchema(schema.$id)
      console.log(`${file}: valid schema`)
    }
  }
} catch (error) {
  console.error(`Schema validation failed: ${error.message}`)
  process.exit(1)
}
