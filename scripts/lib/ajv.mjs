// Shared offline Ajv setup for every AI design-system contract consumer.
// Ajv ships draft-07 under the historical HTTP URI; our immutable contracts
// correctly declare its HTTPS URI, so register that exact alias locally.
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { createRequire } from 'node:module'
import { readDoc } from './paths.mjs'

const require = createRequire(import.meta.url)
const draft7MetaSchema = require('ajv/dist/refs/json-schema-draft-07.json')

export const CONTRACT_SCHEMA_FILES = [
  'ai-design-facets.schema.json',
  'ai-flowspec.schema.json',
  'ai-selectionspec.schema.json',
  'ai-buildreport.schema.json',
  'ai-canonical-profiles.schema.json',
]

export function createContractAjv() {
  const ajv = new Ajv({ allErrors: true, strict: true, validateSchema: true })
  ajv.addMetaSchema(draft7MetaSchema, 'https://json-schema.org/draft-07/schema#')
  addFormats(ajv)
  return ajv
}

/** Register all immutable contract schemas in dependency-safe order. */
export function registerContractSchemas(ajv) {
  for (const file of CONTRACT_SCHEMA_FILES) ajv.addSchema(readDoc(file))
  return ajv
}

/** Return a compiled validator for one registered contract. */
export function getContractValidator(ajv, schemaFile) {
  const schema = readDoc(schemaFile)
  const validate = ajv.getSchema(schema.$id)
  if (!validate) throw new Error(`Contract schema was not registered: ${schemaFile}`)
  return validate
}
