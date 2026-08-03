// Multi-flow discovery: scans a directory for FlowSpec / SelectionSpec /
// BuildReport contract documents, classified by shape using the same
// convention as scripts/validate-spec.mjs (`steps` -> FlowSpec, `flowId`+
// `checks` -> BuildReport, `screens` -> SelectionSpec), and groups them into
// one triple per flowId (RFC 008). Provenance sidecars (`*.provenance.json`)
// are not contract documents and are skipped as scan inputs, but a triple's
// sidecar is attached by the `buildreport-<flowId>.provenance.json` naming
// convention when present.
//
// Fail-loud, mirroring scripts/lib/check-registry.mjs's UnsupportedCheckError:
// this never silently drops a partial flow. It throws FlowDiscoveryError for:
//   - a contract document whose filename is not exactly the mechanically
//     derived `<artifact>-<flowId>.json` for its own kind and flowId;
//   - two documents of the same kind claiming the same flowId (reachable when
//     the same basename exists correctly-named in two different subfolders,
//     since the scan is recursive);
//   - a flowId whose triple is missing any of the three contract kinds.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

// BOM-tolerant, like scripts/validate-spec.mjs / scripts/validate-provenance.mjs.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

export class FlowDiscoveryError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FlowDiscoveryError'
  }
}

// kind -> { artifact basename prefix, field name on a discovered triple }
const KIND_INFO = {
  FlowSpec: { artifact: 'flowspec', field: 'flowSpecPath' },
  SelectionSpec: { artifact: 'selectionspec', field: 'selectionSpecPath' },
  BuildReport: { artifact: 'buildreport', field: 'buildReportPath' },
}

/** Classify a parsed document by shape (same convention as validate-spec.mjs). */
function classify(doc) {
  if (doc && doc.steps) return 'FlowSpec'
  if (doc && doc.checks && doc.flowId) return 'BuildReport'
  if (doc && doc.screens) return 'SelectionSpec'
  return null
}

/**
 * Discover flow triples under `dir` (default docs/examples/). Returns one
 * `{ flowId, flowSpecPath, selectionSpecPath, buildReportPath, provenancePath }`
 * entry per flow, sorted by flowId (`provenancePath` is `null` when no sidecar
 * exists yet). Throws FlowDiscoveryError — see module doc — instead of
 * returning a partial/ambiguous result.
 */
export function discoverFlows(dir = join(ROOT, 'docs', 'examples')) {
  if (!existsSync(dir)) return []

  const byFlow = new Map() // flowId -> { flowSpecPath?, selectionSpecPath?, buildReportPath? }

  for (const rel of readdirSync(dir, { recursive: true }).map(String)) {
    if (!/\.json$/.test(rel)) continue
    if (rel.endsWith('.provenance.json')) continue
    const full = join(dir, rel)

    let doc
    try {
      doc = readJson(full)
    } catch {
      // Malformed JSON is not this module's concern; the schema validators
      // (npm run validate:spec) own reporting that. Skip it here.
      continue
    }
    const kind = classify(doc)
    if (!kind) continue // not a recognizable contract document (e.g. a scratch report)

    const flowId = doc.flowId
    if (typeof flowId !== 'string' || flowId.length === 0) {
      throw new FlowDiscoveryError(`${full}: ${kind} document has no string "flowId"; cannot discover its flow`)
    }

    const info = KIND_INFO[kind]
    const actualName = rel.split(/[\\/]/).pop()
    const expectedName = `${info.artifact}-${flowId}.json`
    if (actualName !== expectedName) {
      throw new FlowDiscoveryError(
        `${full}: ${kind} for flowId "${flowId}" must be named "${expectedName}" (found "${actualName}")`,
      )
    }

    const entry = byFlow.get(flowId) ?? {}
    if (entry[info.field]) {
      throw new FlowDiscoveryError(
        `Duplicate ${kind} for flowId "${flowId}": both "${entry[info.field]}" and "${full}" exist`,
      )
    }
    entry[info.field] = full
    byFlow.set(flowId, entry)
  }

  const flows = []
  for (const [flowId, entry] of byFlow) {
    const missing = Object.entries(KIND_INFO)
      .filter(([, info]) => !entry[info.field])
      .map(([kind]) => kind)
    if (missing.length > 0) {
      throw new FlowDiscoveryError(`Incomplete flow triple for flowId "${flowId}": missing ${missing.join(', ')}`)
    }
    const provenancePath = join(dir, `buildreport-${flowId}.provenance.json`)
    flows.push({
      flowId,
      flowSpecPath: entry.flowSpecPath,
      selectionSpecPath: entry.selectionSpecPath,
      buildReportPath: entry.buildReportPath,
      provenancePath: existsSync(provenancePath) ? provenancePath : null,
    })
  }
  flows.sort((a, b) => a.flowId.localeCompare(b.flowId))
  return flows
}
