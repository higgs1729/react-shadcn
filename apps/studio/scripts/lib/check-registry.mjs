// Single source of truth mapping a SelectionSpec `checksPlanned` ID to an
// executable command. Every ID a SelectionSpec can plan must be listed here;
// resolveCheck() throws UnsupportedCheckError for anything else so an unknown
// planned check fails loudly instead of being silently skipped.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

export const KNOWN_CHECK_IDS = [
  'lint',
  'typecheck',
  'a11y',
  'story',
  // task-12-runtime-quality-and-security.md additions. These are flow-level /
  // repo-wide, not per-screen (a single browser smoke run covers all golden
  // routes; dependency/secret scanning covers the whole repo), so they run
  // the same way `lint`/`typecheck` do regardless of which screen plans
  // them. See docs/layers/30-implementation/ai-implementation-instructions.md
  // "Runtime quality and security checks" for required-now vs observational
  // status and flake/false-positive trade-offs.
  'smoke',
  'deps-audit',
  'secret-scan',
]

export class UnsupportedCheckError extends Error {
  constructor(checkId) {
    super(`Unsupported planned check id: "${checkId}". Known ids: ${KNOWN_CHECK_IDS.join(', ')}.`)
    this.name = 'UnsupportedCheckError'
    this.checkId = checkId
  }
}

// `lint`/`typecheck` have no per-screen granularity in this repo (single
// eslint/tsconfig run) - every screen that plans them runs the same
// whole-repo command. The planned-checks runner dedupes identical commands
// across screens so the repo isn't re-linted/re-typechecked per screen.
function repoWideCheck(id, npmScript) {
  return { id, command: `npm run ${npmScript}`, npmArgs: ['run', npmScript], env: {} }
}

// `a11y` and `story` both exercise the screen's rendered composition story
// (components/patterns/<screenPattern>-screen.stories.tsx, produced by
// scripts/gen-pattern-stories.mjs) through Storybook 10's portable-stories
// integration (@storybook/addon-vitest / vitest.config.ts), in a real
// browser (Playwright/Chromium) - not `storybook build`, which only proves
// the static site compiles and never renders a story or runs axe.
//
// `story`  = the story mounts and its play function (if any) completes
//            without throwing. This is addon-vitest's default per-story
//            test; no violation category is asserted.
// `a11y`   = the same render, plus a zero-violations assertion. The gate is
//            toggled via VITE_SB_A11Y_MODE=error, read by
//            .storybook/preview.tsx as `import.meta.env.VITE_SB_A11Y_MODE`
//            (plain `process.env.*` is not available in the browser bundle
//            Vite serves for browser-mode tests).
function screenStoryCheck(id, screen) {
  const registryItem = screen?.screenPattern?.registryItem
  if (!registryItem) {
    throw new Error(
      `Screen "${screen?.stepId}" has no screenPattern.registryItem; cannot resolve its story file for the "${id}" check.`,
    )
  }
  const rel = join('components', 'patterns', `${registryItem}-screen.stories.tsx`).replace(/\\/g, '/')
  if (!existsSync(join(ROOT, rel))) {
    throw new Error(
      `Expected story file not found for screen pattern "${registryItem}": ${rel}. Run 'npm run gen:pattern-stories' first.`,
    )
  }
  const env = id === 'a11y' ? { VITE_SB_A11Y_MODE: 'error' } : {}
  const label = id === 'a11y' ? `${rel} (VITE_SB_A11Y_MODE=error)` : rel
  return {
    id,
    command: `vitest run --project=storybook ${label}`,
    npxArgs: ['vitest', 'run', '--project=storybook', rel],
    env,
  }
}

/** Resolve a planned check ID + its screen to a runnable command descriptor. */
export function resolveCheck(checkId, screen) {
  switch (checkId) {
    case 'lint':
      return repoWideCheck('lint', 'lint')
    case 'typecheck':
      return repoWideCheck('typecheck', 'typecheck')
    case 'a11y':
      return screenStoryCheck('a11y', screen)
    case 'story':
      return screenStoryCheck('story', screen)
    case 'smoke':
      return repoWideCheck('smoke', 'test:smoke')
    case 'deps-audit':
      return repoWideCheck('deps-audit', 'audit:deps')
    case 'secret-scan':
      return repoWideCheck('secret-scan', 'scan:secrets')
    default:
      throw new UnsupportedCheckError(checkId)
  }
}
