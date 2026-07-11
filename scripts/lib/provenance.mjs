// Shared, deterministic, offline helpers for the provenance sidecar format
// (docs/provenance/ai-provenance.schema.json). Both the generator
// (scripts/gen-provenance.mjs) and the validator (scripts/validate-provenance.mjs)
// build digests through these functions so a recorded digest and a recomputed
// digest can only differ when the underlying artifact content actually changed.
//
// Digests are taken over CANONICAL JSON (recursively key-sorted, no insignificant
// whitespace) rather than raw bytes. This makes them reproducible across
// formatting, UTF-8 BOM, and CRLF/LF differences — exactly the noise a
// reproducibility manifest must ignore.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'
import { docPath } from './paths.mjs'

/** Stable JSON stringify: object keys are sorted recursively; arrays keep order. */
export function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/** sha256 hex digest of an arbitrary JSON-serializable value's canonical form. */
export function canonicalDigest(value) {
  return createHash('sha256').update(canonicalize(value)).digest('hex')
}

// BOM-tolerant JSON read, matching scripts/validate-spec.mjs.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

/**
 * Build one digest entry { path, algorithm, digest } for a JSON artifact.
 * `label` is the recorded basename; `absPath` is where to read it from.
 */
export function digestArtifact(label, absPath) {
  return { path: label, algorithm: 'sha256', digest: canonicalDigest(readJson(absPath)) }
}

/**
 * Deterministic digest of the whole registry/ inventory: a key-sorted map of
 * {filename -> canonical digest of that file}, then digested. Adding, removing,
 * or editing any registry item changes this single digest.
 */
export function digestRegistryInventory(registryDir) {
  const map = {}
  if (existsSync(registryDir)) {
    for (const file of readdirSync(registryDir).sort()) {
      if (!file.endsWith('.json')) continue
      map[file] = canonicalDigest(readJson(join(registryDir, file)))
    }
  }
  return { path: 'registry/', algorithm: 'sha256', digest: canonicalDigest(map) }
}

/**
 * Resolve a source artifact's absolute path. When `baseDir` is given, the
 * artifact is looked up there by basename (used by the regression test against
 * copied/mutated inputs); otherwise it is resolved location-independently via
 * scripts/lib/paths.mjs. A filesystem path passed directly is honored as-is.
 */
export function resolveInput(nameOrPath, baseDir) {
  if (existsSync(nameOrPath) && !baseDir) return nameOrPath
  const name = basename(nameOrPath)
  if (baseDir) {
    const candidate = join(baseDir, name)
    if (existsSync(candidate)) return candidate
  }
  return docPath(name)
}

// Keys that must never appear anywhere in a manifest. Enforced by the validator
// as defense-in-depth on top of the schema's additionalProperties:false, and
// documented beside the format in the schema $comment.
export const PROHIBITED_KEY_PATTERN =
  /(password|passwd|secret|token|api[-_]?key|credential|authorization|bearer|cookie|session|private[-_]?key|env|prompt|reasoning|chain[-_]?of[-_]?thought|scratchpad|user[-_]?data)/i

/** Return a list of prohibited key paths found anywhere in the manifest. */
export function findProhibitedKeys(value, path = '') {
  const hits = []
  if (Array.isArray(value)) {
    value.forEach((v, i) => hits.push(...findProhibitedKeys(v, `${path}[${i}]`)))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const here = path ? `${path}.${k}` : k
      if (PROHIBITED_KEY_PATTERN.test(k)) hits.push(here)
      hits.push(...findProhibitedKeys(v, here))
    }
  }
  return hits
}
