# AI Implementation Instructions

Build working code from an already-decided selection. Input is a `SelectionSpec` that passes `npm run validate:spec -- <file>`; output is a `BuildReport` that passes the same command. Screens listed in the SelectionSpec's `unresolved` are copied to the BuildReport's `unresolved` and never built.

## Pipeline

1. **Install registry items** — `node scripts/install-selection.mjs <spec>` (task-02-install-runner.md).
2. **Compose pages** — wire the installed screen pattern and blocks into a route under `app/flows/<flowId>/<stepId>/` (task-03-page-composition.md).
3. **Generate stories** — `node scripts/gen-pattern-stories.mjs <spec>` (task-04-story-generation.md).
4. **Run checks**:
   - `node scripts/run-checks.mjs` — fixed whole-repo suite (task-05-check-loop.md): contracts, lint, typecheck, build, `build-storybook`.
   - `node scripts/run-planned-checks.mjs <spec>` — executes every check each screen's `checksPlanned` actually names (see "Planned checks" below). This is the one that decides whether a screen's declared checks were honored, not just whether the repo compiles.

## Fix Loop Policy

If any check fails, fix only files created in steps 2-3 of this pipeline. Never edit `components/ui/*`, `registry/*.json` facets, or `docs/contracts/*`. Then rerun the checks.

Maximum 3 iterations. If still failing after 3 iterations:

- `status: "failed"` if no screen reached `built` with all its checks passing.
- `status: "partial"` if at least one screen is `built` and all checks that touch it pass.

Stop after reaching a terminal status; do not keep iterating.

## Planned checks

A SelectionSpec screen's `checksPlanned` names check IDs, not commands. `scripts/lib/check-registry.mjs`
is the single mapping from ID to executable command; `scripts/run-planned-checks.mjs <spec>` reads a
SelectionSpec, resolves every screen's planned IDs through that registry, and runs them. An ID with no
mapping is a hard failure (named in the output), never a silent skip.

| Check ID    | What actually runs                                                                        |
| ----------- | ------------------------------------------------------------------------------------------ |
| `lint`      | `npm run lint` (whole repo; same command for every screen that plans it)                   |
| `typecheck` | `npm run typecheck` (whole repo)                                                            |
| `story`     | `vitest run --project=storybook components/patterns/<screenPattern>-screen.stories.tsx` — mounts the screen's composed story in a real browser (Playwright/Chromium) via Storybook 10 portable stories, and runs any `play` function on it |
| `a11y`      | The same story run, with `VITE_SB_A11Y_MODE=error` — asserts zero axe violations on the rendered DOM |

**`storybook build` (in `npm run checks`) only proves the static Storybook site compiles.** It never mounts a
component, dispatches an event, or runs axe, so it cannot stand in for `story` or `a11y`. Those two require
`vitest.config.ts`'s `storybook` project (Storybook's addon-vitest + `@vitest/browser` + Playwright), which
renders each story for real. `.storybook/preview.tsx` reads `import.meta.env.VITE_SB_A11Y_MODE` (not
`process.env.*` — Vite doesn't expose that to the browser bundle) to switch axe from reporting-only (`todo`,
the default for `npm run storybook`) to failing the test (`error`, used only by the `a11y` check).

### Browser setup (local, CI, and Windows)

The rendered checks require Playwright's Chromium binary in addition to the npm dependency. Run this once
after `npm install`, and run the equivalent in CI before `npm run checks:planned`:

```sh
npm run setup:playwright
# equivalent: npm exec playwright install chromium
```

This command is supported on Windows as well as CI runners; it downloads the browser into Playwright's managed
cache. Do not substitute the locally installed Chrome or skip browser installation: `checks:planned` must fail
if its real browser-backed `story` or `a11y` checks cannot run.

Add a `play` function to a screen's `-screen.stories.tsx` story when its check should exercise a specific
interaction, not just confirm the screen renders (see `components/patterns/login-03-screen.stories.tsx`'s
`FillAndSubmit` story for the pattern — type into fields via `userEvent`, assert on the result, and avoid
triggering an unhandled native form submit, which navigates the page and kills the test).

## BuildReport Emission

Write the result to `docs/examples/buildreport-<flowId>.json` and validate it with `npm run validate:spec -- docs/examples/buildreport-<flowId>.json`.
