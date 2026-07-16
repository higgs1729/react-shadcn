import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

const EXPECTED_CLAUDE = `<!-- Canonical source: AGENTS.md. Keep this file as a deterministic shim for Claude-compatible tools. -->

@AGENTS.md
`

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'out',
  'storybook-static',
  'test-results',
  'docs',
  '.claude',
])

function displayPath(path) {
  const rel = relative(ROOT, path)
  return rel && !rel.startsWith('..') ? rel.replace(/\\/g, '/') : path
}

function findAgentsFiles(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      findAgentsFiles(join(dir, entry.name), found)
      continue
    }
    if (entry.name === 'AGENTS.md') found.push(join(dir, entry.name))
  }
  return found
}

const errors = []

/**
 * Depth-1 rule: inside an AGENTS.md "Map"/"索引" section, backtick path tokens
 * may reference at most ONE directory level below the node (a child dir, a
 * child file like `docs/STATUS.md`, or a child glob like `registry/*.json`).
 * Grandchild paths (`app/(system)/`, `layers/10-upstream/`) must live in the
 * child node's own AGENTS.md instead.
 */
function checkMapDepth(agentsPath, content) {
  const lines = content.split('\n')
  let inIndex = false
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (/^##\s/.test(line)) {
      inIndex = /Map|索引/.test(line)
      continue
    }
    if (!inIndex) continue
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      const token = m[1]
      if (!token.includes('/')) continue
      if (!/^[\w.()\[\]*-]+(\/[\w.()\[\]*-]+)*\/?$/.test(token)) continue
      const stripped = token.replace(/\/$/, '')
      const segs = stripped.split('/').filter(Boolean)
      const dirDepth = token.endsWith('/') ? segs.length : segs.length - 1
      if (dirDepth >= 2) {
        errors.push(
          `${displayPath(agentsPath)}:${i + 1} depth-1 violation: \`${token}\` — 孫パスは子ノードの AGENTS.md に書く`,
        )
      }
    }
  }
}

// docs/ is checked explicitly (excluded from the generic walk above so its
// own AGENTS.md doesn't get swept up with a marker check meant for root).
const nodes = [ROOT, join(ROOT, 'docs'), ...findAgentsFiles(ROOT).map((p) => resolve(p, '..'))]
const uniqueNodes = [...new Set(nodes)]

for (const dir of uniqueNodes) {
  const agentsPath = join(dir, 'AGENTS.md')
  const claudePath = join(dir, 'CLAUDE.md')

  if (!existsSync(agentsPath)) {
    errors.push(`${displayPath(claudePath)} exists without a sibling AGENTS.md`)
    continue
  }
  if (!existsSync(claudePath)) {
    errors.push(`${displayPath(agentsPath)} exists without a sibling CLAUDE.md shim`)
    continue
  }

  const agents = readFileSync(agentsPath, 'utf8').replace(/\r\n/g, '\n')
  const claude = readFileSync(claudePath, 'utf8').replace(/\r\n/g, '\n')

  if (dir === ROOT && !agents.includes('# AI Design System')) {
    errors.push(`${displayPath(agentsPath)} does not look like the canonical root agent instruction file`)
  }

  checkMapDepth(agentsPath, agents)

  if (claude !== EXPECTED_CLAUDE) {
    errors.push(`${displayPath(claudePath)} must stay as the fixed shim that imports ${displayPath(agentsPath)}`)
  }
}

if (errors.length > 0) {
  console.error('Docs structure validation failed.')
  for (const err of errors) console.error(`- ${err}`)
  process.exit(1)
}

console.log(`Docs structure validated: ${uniqueNodes.length} AGENTS.md/CLAUDE.md node(s) in sync.`)
