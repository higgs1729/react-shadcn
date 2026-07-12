// Shared, offline registry-facet reader for scripts that reason about the
// AI design-system inventory. Mirrors the loader in scripts/validate-pipeline.mjs
// (registry/*.json, facets live at meta.aiDesignSystem) but returns the FULL
// facet object per item and adds convenience filters by assetKind / screenType /
// blockRole so selection tooling does not re-implement registry traversal.
//
// A malformed registry file is skipped (its name maps to null facets), exactly
// like the precedent loader — the registry validators own malformed-file
// diagnostics, not this reader.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

// BOM-tolerant JSON read, matching scripts/validate-spec.mjs / validate-pipeline.mjs.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

/**
 * Map<itemName, facets|null> where facets is the item's meta.aiDesignSystem
 * object. A file that fails to parse or has no string name maps to null facets.
 */
export function loadRegistryFacets(dir = join(ROOT, 'registry')) {
  const items = new Map()
  if (!existsSync(dir)) return items
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const item = readJson(join(dir, file))
      if (item && typeof item.name === 'string') {
        items.set(item.name, item.meta?.aiDesignSystem ?? null)
      }
    } catch {
      items.set(file.replace(/\.json$/, ''), null)
    }
  }
  return items
}

/** All [name, facets] entries whose facets match a predicate (facets != null). */
export function filterRegistry(items, predicate) {
  const out = []
  for (const [name, facets] of items) {
    if (facets != null && predicate(facets)) out.push([name, facets])
  }
  return out
}

/** Screen-pattern items for a resolved screenType. */
export function screenPatternsFor(items, screenType) {
  return filterRegistry(
    items,
    (f) => f.assetKind === 'screen-pattern' && f.screenType === screenType,
  )
}

/** Block-pattern items for a blockRole. */
export function blockPatternsFor(items, blockRole) {
  return filterRegistry(
    items,
    (f) => f.assetKind === 'block-pattern' && f.blockRole === blockRole,
  )
}
