import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const EXPECTED_CLAUDE = `<!-- Canonical source: AGENTS.md. Keep this file as a deterministic shim for Claude-compatible tools. -->

@AGENTS.md
`

const args = process.argv.slice(2)

function valueAfter(flag, fallback) {
  const idx = args.indexOf(flag)
  return idx === -1 ? fallback : args[idx + 1]
}

function firstPositional() {
  return args.find((arg, idx) => !arg.startsWith('--') && !args[idx - 1]?.startsWith('--'))
}

function displayPath(path) {
  const rel = relative(process.cwd(), path)
  return rel && !rel.startsWith('..') ? rel : path
}

function readRequired(path) {
  if (!existsSync(path)) {
    throw new Error(`file not found: ${displayPath(path)}`)
  }
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
}

function focusedDiff(expected, actual) {
  const expectedLines = expected.split('\n')
  const actualLines = actual.split('\n')
  const max = Math.max(expectedLines.length, actualLines.length)
  const out = []

  for (let i = 0; i < max; i += 1) {
    if (expectedLines[i] === actualLines[i]) continue
    out.push(`line ${i + 1}`)
    if (expectedLines[i] !== undefined) out.push(`- ${expectedLines[i]}`)
    if (actualLines[i] !== undefined) out.push(`+ ${actualLines[i]}`)
  }

  return out.join('\n')
}

const agentsPath = resolve(valueAfter('--agents', 'AGENTS.md'))
const claudePath = resolve(valueAfter('--claude', firstPositional() ?? 'CLAUDE.md'))

try {
  const agents = readRequired(agentsPath)
  const claude = readRequired(claudePath)

  if (!agents.includes('# AI Design System')) {
    throw new Error(`${displayPath(agentsPath)} does not look like the canonical agent instruction file`)
  }

  if (claude !== EXPECTED_CLAUDE) {
    console.error('Agent instruction sync failed.')
    console.error(`${displayPath(claudePath)} must stay as the fixed shim that imports ${displayPath(agentsPath)}.`)
    console.error('Edit AGENTS.md for instruction changes, then keep CLAUDE.md unchanged.')
    console.error('')
    console.error(focusedDiff(EXPECTED_CLAUDE, claude))
    process.exit(1)
  }

  console.log(`Agent instructions are synchronized: ${displayPath(claudePath)} imports ${displayPath(agentsPath)}.`)
} catch (error) {
  console.error(`Agent instruction sync failed: ${error.message}`)
  process.exit(1)
}
