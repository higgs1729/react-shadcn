// Regression coverage for fail-closed contract validation. Every fixture must
// fail with a useful error category; a successful command is a test failure.
import { copyFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const fixtures = join(ROOT, 'scripts', 'fixtures', 'validators')
const run = (args) => spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' })

function expectFailure(label, args, category) {
  const result = run(args)
  const output = `${result.stdout}${result.stderr}`
  if (result.status === 0 || !category.test(output)) {
    throw new Error(`${label}: expected non-zero status and ${category}; got ${result.status}: ${output}`)
  }
  console.log(`${label}: rejected as expected`)
}

try {
  expectFailure('invalid JSON', ['scripts/validate-spec.mjs', join(fixtures, 'invalid-json.json')], /invalid JSON/i)
  expectFailure('additional property', ['scripts/validate-spec.mjs', join(fixtures, 'additional-property.json')], /additional properties/i)
  expectFailure('invalid enum', ['scripts/validate-spec.mjs', join(fixtures, 'invalid-enum.json')], /must be equal to one of the allowed values/i)
  expectFailure('invalid schema keyword', ['scripts/validate-schemas.mjs', join(fixtures, 'invalid-schema-keyword.json')], /unknown keyword/i)
  expectFailure('invalid schema reference', ['scripts/validate-schemas.mjs', join(fixtures, 'invalid-schema-reference.json')], /can't resolve reference/i)

  const scanFixture = join(ROOT, 'docs', 'examples', 'negative-unrecognized-example.json')
  if (existsSync(scanFixture)) throw new Error(`Refusing to overwrite existing fixture: ${scanFixture}`)
  copyFileSync(join(fixtures, 'unrecognized-example.json'), scanFixture)
  try {
    expectFailure('unrecognized examples JSON', ['scripts/validate-spec.mjs'], /neither FlowSpec/i)
  } finally {
    rmSync(scanFixture, { force: true })
  }
} catch (error) {
  console.error(`Validator regression test failed: ${error.message}`)
  process.exit(1)
}
