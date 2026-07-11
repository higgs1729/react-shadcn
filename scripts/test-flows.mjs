// Regression coverage for scripts/lib/flows.mjs's discoverFlows(). RFC 008
// requires fail-loud behavior for the three ways a directory of contract
// documents can fail to form clean flow triples, and correct multi-flow
// discovery when it does. Fixtures live under scripts/fixtures/flows/.
//
// Run: node scripts/test-flows.mjs  (or npm run test:flows)
import { join } from 'node:path'
import { discoverFlows, FlowDiscoveryError } from './lib/flows.mjs'

const ROOT = process.cwd()
const FIX = join(ROOT, 'scripts', 'fixtures', 'flows')

function expectDiscoveryError(label, dir, needles) {
  try {
    discoverFlows(dir)
  } catch (e) {
    if (!(e instanceof FlowDiscoveryError)) {
      throw new Error(`${label}: expected a FlowDiscoveryError, got ${e.constructor.name}: ${e.message}`)
    }
    for (const needle of needles) {
      if (!e.message.includes(needle)) {
        throw new Error(`${label}: expected message to include "${needle}"; got: ${e.message}`)
      }
    }
    console.log(`${label}: rejected as expected (${e.message})`)
    return
  }
  throw new Error(`${label}: expected discoverFlows() to throw, but it returned normally`)
}

try {
  // Incomplete triple: FlowSpec + SelectionSpec present, BuildReport missing.
  // Must name the flowId and the missing kind.
  expectDiscoveryError('incomplete triple', join(FIX, 'incomplete'), ['fixture-incomplete-01', 'BuildReport'])

  // Misnamed file: a FlowSpec whose own flowId does not match its filename.
  // Must name the offending file and the expected filename.
  expectDiscoveryError(
    'misnamed file',
    join(FIX, 'misnamed'),
    ['flowspec-fixture-misnamed-01.json', 'flowspec-fixture-wrongname-01.json'],
  )

  // Two complete triples in one directory: discovery must find both flows,
  // proving multi-flow support (not just the first/only one).
  const multi = discoverFlows(join(FIX, 'multi'))
  const ids = multi.map((f) => f.flowId).sort()
  if (ids.length !== 2 || ids[0] !== 'fixture-multi-a' || ids[1] !== 'fixture-multi-b') {
    throw new Error(`two-triple fixture: expected flows [fixture-multi-a, fixture-multi-b]; got [${ids.join(', ')}]`)
  }
  for (const flow of multi) {
    if (!flow.flowSpecPath || !flow.selectionSpecPath || !flow.buildReportPath) {
      throw new Error(`two-triple fixture: flow "${flow.flowId}" is missing a triple member: ${JSON.stringify(flow)}`)
    }
  }
  console.log(`two-triple fixture: discovered both flows as expected (${ids.join(', ')})`)

  // Positive: the real docs/examples/ golden flow discovers cleanly and its
  // flowId matches the golden dryrun-saas-ops-01 flow.
  const golden = discoverFlows()
  const goldenFlow = golden.find((f) => f.flowId === 'dryrun-saas-ops-01')
  if (!goldenFlow) {
    throw new Error(`golden flow: expected "dryrun-saas-ops-01" among discovered flows; got [${golden.map((f) => f.flowId).join(', ')}]`)
  }
  console.log('golden flow: discovered dryrun-saas-ops-01 as expected')
} catch (error) {
  console.error(`Flow discovery regression test failed: ${error.message}`)
  process.exit(1)
}

console.log('All flow discovery regression cases passed.')
