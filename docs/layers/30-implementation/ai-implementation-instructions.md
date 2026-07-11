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

## Runtime quality and security checks

Added by task-12-runtime-quality-and-security.md (RFC 006). Three more check IDs are
registered in `scripts/lib/check-registry.mjs`. Unlike `lint`/`typecheck`/`a11y`/`story`,
these are flow-level / repo-wide rather than per-screen, so a screen's `checksPlanned`
naming one of them runs the same whole-repo command regardless of which screen planned it
(same mechanism as `lint`/`typecheck`).

| Check ID      | Command                | What it does                                                                 | Status |
| ------------- | ----------------------- | ----------------------------------------------------------------------------- | ------------------ |
| `smoke`       | `npm run test:smoke`    | Playwright: boots `next dev`, navigates all 3 golden routes, asserts a route-specific landmark/heading | **Observational** |
| `deps-audit`  | `npm run audit:deps`    | `npm audit --audit-level=high` against the local lockfile (no third-party service) | **Required-now** |
| `secret-scan` | `npm run scan:secrets`  | `scripts/scan-secrets.mjs`: greps `git ls-files` content against fixed high-confidence secret patterns | **Required-now** |

None of these three are wired into `docs/examples/selectionspec-dryrun-02.json`'s
`checksPlanned` yet - that file is a specific dry-run's recorded output (see its
`$comment`), not something this task edits. A future selection run can add `deps-audit`/
`secret-scan` to a screen's `checksPlanned` when repo-wide security gates should be forced
per-screen; `smoke` should stay off `checksPlanned` until it clears its stability bar (below).

### `smoke` (observational) - browser E2E smoke suite

- **What**: `playwright.config.ts` + `e2e/golden-flow.smoke.spec.ts`. Boots a real `next dev`
  server (Turbopack) on a dedicated port and drives Chromium (same Playwright install used by
  `story`/`a11y`) to the three golden routes (`login`, `overview`, `invoice-list`), asserting a
  successful navigation response and a visible route-specific landmark/heading per route.
- **invoice-list states**: `docs/examples/selectionspec-dryrun-02.json` plans
  `stateCoveragePlan: ["default", "loading", "empty", "error"]` for invoice-list, and
  `app/collection-01/collection-screen.tsx`'s `CollectionTableScreen` implements all four via a
  `state` prop. But `app/flows/dryrun-saas-ops-01/invoice-list/page.tsx` hardcodes
  `state="default"` and does not read a `?state=` query param or any other route-level switch -
  loading/empty/error are not reachable through the golden route today. The suite documents this
  gap with a `test.fixme(...)` (not a silent skip) instead of asserting against a URL that cannot
  reach those states; wiring `?state=` through the route is task-03 territory, out of scope here.
- **Runner**: `scripts/run-smoke.mjs` first does a real `chromium.launch()`/`close()` to prove the
  Playwright browser binary is actually installed, and exits 1 with a classified
  `(classification: environment)` message plus `npm run setup:playwright` guidance if it isn't -
  it never silently skips the suite.
- **Why observational, not required-now**: it needs a live dev server, which is one more moving
  part than the in-process `story`/`a11y` checks (Vite browser mode) - slower to boot, and prone to
  port contention across parallel CI shards. It also inherits this repo's known Turbopack
  workspace-root limitation: in a git-worktree checkout whose `node_modules` isn't a full local
  copy (only resolvable by walking up to a parent checkout), `next dev`/`next build` can fail with
  "Next.js inferred your workspace root" even though `next.config.ts` already pins
  `turbopack.root`, because Turbopack's own root inference doesn't do the same walk-up Node's
  module resolution does. This is the same limitation `npm run build` / `build-storybook` already
  have in such a worktree; it is not something this task's route/test code causes or can fix from
  here. Promote `smoke` to required-now once it has run clean for a stability window in an
  environment with a real local `node_modules` (e.g. CI, or the main checkout).

### `deps-audit` / `secret-scan` (required-now)

- **`deps-audit`**: thin wrapper over `npm audit --audit-level=high` - no new tooling, no network
  call beyond what `npm audit` already makes to the npm registry's public advisory data (no
  credentials, no source upload). Baseline: 4 moderate-severity `postcss`/`next` advisories with no
  fix currently available exit 0 at `--audit-level=high`; a newly introduced high/critical
  advisory fails the command. Flake risk: low (deterministic given the lockfile) but not zero (the
  advisory database can change between runs without a lockfile change) - acceptable for a
  required-now gate since a new advisory appearing is exactly the signal this check exists to
  surface, not noise.
- **`secret-scan`**: `scripts/scan-secrets.mjs`, a local, deterministic, credential-free scanner
  (no hosted secret-scanning service). It walks `git ls-files` (so it respects `.gitignore` and
  never touches `node_modules`/`.next`) excluding `docs/archive/` (out of scope per the shared
  ground rules) and `package-lock.json` (dependency metadata, high false-positive rate), and
  matches file content against fixed high-confidence patterns (AWS/GitHub/Slack/Google key
  shapes, PEM private-key headers, explicit `secret`/`token`/`password`/`api_key` assignments).
  Reviewed false positives are allow-listed by exact `(file, patternId, match)` tuple in
  `scripts/fixtures/secrets-baseline.json` (currently empty - the repo baseline is clean); any
  unlisted match is high-severity and fails the command. `scripts/scan-secrets.test.mjs` plants a
  fake AWS-shaped key in a throwaway git repo to prove detection still works, then re-asserts the
  real repo scans clean. False-positive trade-off: pattern-shape matching (not entropy scoring)
  keeps it deterministic and non-flaky, at the cost of missing secrets that don't match a known
  provider's format - acceptable for a first required-now gate; broadening detection is future
  work, not this task's scope.

### a11y coverage on golden routes (task-12 requirement 2)

The `a11y` check ID and its `screenStoryCheck` implementation (above) are unchanged - reused, not
duplicated. `docs/examples/selectionspec-dryrun-02.json` already plans `a11y` for all three golden
screens (`login`, `overview`, `invoice-list`), so `npm run checks:planned` already exercises axe
against the golden routes' rendered stories; this task adds no second runner or check ID for that.
What was missing was proof the gate still *catches* a real violation: this repo had no existing
known-violation fixture, so `components/a11y-fixtures/known-violation.stories.tsx` (a deliberate,
low-flake `image-alt` violation, isolated from the registry/pattern system - not wired into any
SelectionSpec) plus `scripts/a11y-known-violation.test.mjs` were added. The regression test runs
the exact command `screenStoryCheck` resolves for any `a11y`-planned screen
(`vitest run --project=storybook <file>` with `VITE_SB_A11Y_MODE=error`) against that fixture and
asserts it fails, and named the specific `image-alt` rule in local verification.

### Worktree fix: Vite `server.fs.allow` (vitest.config.ts)

While verifying the above, `story`/`a11y` checks were failing in this git-worktree checkout with
"is outside of Vite serving allow list" for `@storybook/addon-vitest`'s setup file - the same
node_modules-resolved-by-walking-up-to-the-parent-checkout situation as the Turbopack issue above,
but here it has an actual fix: Vite's dev server defaults `server.fs.allow` to the project root,
which excludes the parent checkout's `node_modules`. `vitest.config.ts` now explicitly allows both
the project root and the resolved `node_modules` root (via `import.meta.resolve('vitest/package.json')`,
so it is correct in any checkout, worktree or not). Verified: all three golden screens' `a11y`/`story`
checks and the known-violation fixture now pass/fail correctly and repeatably in this worktree.

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
