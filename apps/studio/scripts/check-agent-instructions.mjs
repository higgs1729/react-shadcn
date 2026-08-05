// Verifies the AGENTS.md / CLAUDE.md pairing across the WHOLE repository: every
// AGENTS.md must have a sibling CLAUDE.md that is nothing but a shim importing
// it, and no CLAUDE.md may exist without its AGENTS.md.
//
// Discovery is `git ls-files`, not a filesystem walk. .gitignore then defines the
// boundary exactly once instead of an exclusion list here that has to be kept in
// sync with it — gitignored trees (sampleforYou/, worktrees, build output) drop
// out for free, and a node that is not committed is not a node this repo can
// promise anything about.
//
// Deliberately content-agnostic: it asserts nothing about what an AGENTS.md
// says, only that the Claude-side shim exists and stays a shim. That is what
// lets it run over apps/*, packages/* and the monorepo root alike.
//
// Run: node scripts/check-agent-instructions.mjs [--root <dir>]
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const EXPECTED_CLAUDE = `<!-- Canonical source: AGENTS.md. Keep this file as a deterministic shim for Claude-compatible tools. -->

@AGENTS.md
`

const args = process.argv.slice(2)

function valueAfter(flag, fallback) {
  const idx = args.indexOf(flag)
  return idx === -1 ? fallback : args[idx + 1]
}

/** Repo root, so the check covers every workspace no matter which one invoked it. */
function repoRoot(start) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: start,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch {
    throw new Error(`not inside a git work tree (looked from ${start}); discovery needs 'git ls-files'`)
  }
}

/** Tracked AGENTS.md / CLAUDE.md files, repo-relative and POSIX-separated. */
function trackedInstructionFiles(root) {
  const out = execFileSync('git', ['ls-files', '-z', '--', '*AGENTS.md', '*CLAUDE.md'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 16,
  })
  return out
    .split('\0')
    .filter(Boolean)
    .filter((p) => {
      const base = p.slice(p.lastIndexOf('/') + 1)
      return base === 'AGENTS.md' || base === 'CLAUDE.md'
    })
}

function readNormalized(path) {
  return readFileSync(path, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n')
}

function focusedDiff(expected, actual) {
  const expectedLines = expected.split('\n')
  const actualLines = actual.split('\n')
  const max = Math.max(expectedLines.length, actualLines.length)
  const out = []

  for (let i = 0; i < max; i += 1) {
    if (expectedLines[i] === actualLines[i]) continue
    out.push(`  line ${i + 1}`)
    if (expectedLines[i] !== undefined) out.push(`  - ${expectedLines[i]}`)
    if (actualLines[i] !== undefined) out.push(`  + ${actualLines[i]}`)
  }

  return out.join('\n')
}

try {
  const root = resolve(valueAfter('--root', repoRoot(process.cwd())))
  const tracked = trackedInstructionFiles(root)

  if (tracked.length === 0) {
    throw new Error(`no tracked AGENTS.md/CLAUDE.md found under ${root}`)
  }

  // Group by the directory each file sits in; that directory is the "node".
  const nodes = new Map()
  for (const rel of tracked) {
    const dir = dirname(rel)
    const node = nodes.get(dir) ?? { agents: false, claude: false }
    if (rel.endsWith('CLAUDE.md')) node.claude = true
    else node.agents = true
    nodes.set(dir, node)
  }

  const errors = []
  for (const [dir, node] of [...nodes].sort(([a], [b]) => a.localeCompare(b))) {
    const label = dir === '.' ? '(repo root)' : dir

    if (node.agents && !node.claude) {
      errors.push(`${label}: AGENTS.md has no sibling CLAUDE.md shim`)
      continue
    }
    if (node.claude && !node.agents) {
      errors.push(`${label}: CLAUDE.md exists without a sibling AGENTS.md`)
      continue
    }

    const claudePath = join(root, dir, 'CLAUDE.md')
    if (!existsSync(claudePath)) {
      errors.push(`${label}: CLAUDE.md is tracked but missing from the work tree`)
      continue
    }

    const claude = readNormalized(claudePath)
    if (claude !== EXPECTED_CLAUDE) {
      errors.push(
        `${label}: CLAUDE.md must stay the fixed shim that imports its sibling AGENTS.md\n${focusedDiff(
          EXPECTED_CLAUDE,
          claude,
        )}`,
      )
    }
  }

  if (errors.length > 0) {
    console.error('Agent instruction sync failed.')
    console.error('Edit AGENTS.md for instruction changes; CLAUDE.md stays a two-line shim.')
    console.error('')
    for (const err of errors) console.error(`- ${err}`)
    process.exit(1)
  }

  const where = relative(process.cwd(), root).replace(/\\/g, '/') || '.'
  console.log(`Agent instructions are synchronized: ${nodes.size} AGENTS.md/CLAUDE.md node(s) (repo root: ${where})`)
} catch (error) {
  console.error(`Agent instruction sync failed: ${error.message}`)
  process.exit(1)
}
