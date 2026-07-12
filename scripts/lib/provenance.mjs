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

const EXAMPLES_DIR = join(process.cwd(), 'docs', 'examples')

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
 * The set of registry item names a flow actually references, derived from its
 * SelectionSpec: the union, over every screen, of `screenPattern.registryItem`
 * and each block selection's `registryItem`. Returned sorted and de-duplicated
 * so generator and validator digest exactly the same set in the same order.
 * (registryDependencies are component-level deps, not registry pattern items,
 * and are intentionally excluded.)
 */
export function referencedRegistryItems(selectionSpec) {
  const names = new Set()
  for (const screen of selectionSpec?.screens ?? []) {
    const pattern = screen?.screenPattern?.registryItem
    if (typeof pattern === 'string' && pattern.length > 0) names.add(pattern)
    for (const block of screen?.blocks ?? []) {
      const item = block?.registryItem
      if (typeof item === 'string' && item.length > 0) names.add(item)
    }
  }
  return [...names].sort()
}

/**
 * Selection-SCOPED digest of the registry inventory: a digest entry
 * { path, algorithm, digest, items } computed over ONLY the registry items a
 * flow references (`referencedNames`), as a key-sorted map of
 * {name -> canonical digest of registry/<name>.json}, then digested. The sorted
 * `items` list is recorded so the validator recomputes the exact same set
 * deterministically. Because it covers only referenced items, adding, editing,
 * or removing an UNRELATED registry item never changes this digest — only a
 * change to a referenced item does.
 *
 * A referenced item with no `registry/<name>.json` file is a hard, fail-loud
 * error (never a silent skip): a flow cannot be provenance-traced against an
 * inventory that is missing a pattern it selected.
 */
export function digestSelectionInventory(registryDir, referencedNames) {
  const names = [...new Set(referencedNames)].sort()
  const map = {}
  for (const name of names) {
    const file = join(registryDir, `${name}.json`)
    if (!existsSync(file)) {
      throw new Error(`referenced registry item not found: ${name} (expected ${file})`)
    }
    map[name] = canonicalDigest(readJson(file))
  }
  return {
    path: 'registry/ (selection-scoped)',
    algorithm: 'sha256',
    digest: canonicalDigest(map),
    items: names,
  }
}

/**
 * Resolve a doc input for the generator's explicit mode. A value that carries a
 * directory component, or that already exists as a path relative to cwd, is
 * honored as-is. A BARE basename is resolved by preferring the in-pipeline copy
 * under docs/examples/ (so a basename that exists in both docs/examples/ and,
 * e.g., docs/layers/10-upstream/ is unambiguous); otherwise it falls back to
 * location-independent resolution via scripts/lib/paths.mjs (which still throws
 * loudly on a genuinely missing or ambiguous name outside docs/examples/).
 */
export function resolveDoc(nameOrPath) {
  const name = basename(nameOrPath)
  if (nameOrPath !== name || existsSync(nameOrPath)) return nameOrPath
  const inExamples = join(EXAMPLES_DIR, name)
  if (existsSync(inExamples)) return inExamples
  return docPath(name)
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
