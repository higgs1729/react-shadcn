// Stop-hook body, shared by every agent that works in this repository.
//
// The hook contract is identical across Claude Code and Codex (exit 2 + stderr
// means "do not end the turn yet"), so the check itself lives here once and each
// agent's config only registers it. See ~/.agents/notes/hooks-cross-agent.md.
//
// Node rather than a shell one-liner on purpose: this repo is developed on
// Windows, where a POSIX `in=$(cat); case ... esac` command is not portable
// across the shells the different agents spawn. `node` is already a hard
// dependency of every workspace here.
//
// Registered in: .claude/settings.json (Stop) and .codex/hooks.json (Stop).
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// fd 0 is the hook payload. A missing or non-JSON payload is not a reason to
// skip the check, so fall back to an empty object rather than bailing out.
let payload = {}
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  payload = {}
}

// Claude Code re-invokes the Stop hook after the model responds to a block.
// Without this guard the turn can never terminate while validate stays red.
if (payload.stop_hook_active === true) process.exit(0)

const result = spawnSync('npm', ['run', 'validate'], {
  cwd: REPO_ROOT,
  shell: true,
  encoding: 'utf8',
})

if (result.status === 0) process.exit(0)

const tail = `${result.stdout ?? ''}${result.stderr ?? ''}`
  .split(/\r?\n/)
  .filter((line) => line.trim())
  .slice(-20)
  .join('\n')

console.error(
  ['npm run validate が失敗しています。終了する前に修正してください。', '', '再現: npm run validate', '', tail].join(
    '\n',
  ),
)
process.exit(2)
