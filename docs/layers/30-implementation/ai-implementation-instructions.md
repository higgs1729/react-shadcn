# AI Implementation Instructions

Build working code from an already-decided selection. Input is a `SelectionSpec` that passes `npm run validate:spec -- <file>`; output is a `BuildReport` that passes the same command. Screens listed in the SelectionSpec's `unresolved` are copied to the BuildReport's `unresolved` and never built.

## State-inventory model

`meta.aiDesignSystem.stateCoverage` records only the states a particular screen-pattern has
actually implemented and evidenced. It is an inventory capability, not a required state
matrix for a `screenType`.

```text
ScreenType inventory
├─ user states: default, loading, empty, error, permission-denied
├─ interaction states: validation-error, disabled, success
└─ environment variants: mobile, dark-mode, rtl
```

Implement exactly the states requested by the selected FlowSpec step. Do not infer extra
states from the screen type, data shape, interaction model, or a generic data-driven rule.
Before claiming a state, add a renderable Storybook story for it; recovery/exit states need a
labelled action where meaningful, validation errors need an associated field error, and
disabled states need a semantically disabled control.

## Pipeline

1. **Install registry items** — `node scripts/install-selection.mjs <spec>`.
2. **Compose pages** — wire the installed screen pattern and blocks into a route under `app/flows/<flowId>/<stepId>/`.
3. **Generate stories** — `node scripts/gen-pattern-stories.mjs <spec>`.
4. **Run checks**:
   - `node scripts/run-checks.mjs` — fixed whole-repo suite: contracts, lint, typecheck, build, `build-storybook`.
   - `node scripts/run-planned-checks.mjs <spec>` — executes every check each screen's `checksPlanned` actually names (see "Planned checks" below). This is the one that decides whether a screen's declared checks were honored, not just whether the repo compiles.

## Fix Loop Policy

If any check fails, fix only files created in steps 2-3 of this pipeline. Never edit `components/ui/*`, `registry/*.json` facets, or `docs/contracts/*`. Then rerun the checks. (The one sanctioned registry write is step 3's `gen-pattern-stories.mjs` writing back `verification.storybookStories`; that is generated verification metadata, not a Fix Loop facet edit.)

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
component or runs axe, so it cannot stand in for `story`/`a11y`, which need `vitest.config.ts`'s `storybook`
project (addon-vitest + `@vitest/browser` + Playwright) to render each story for real. `.storybook/preview.tsx`
reads `import.meta.env.VITE_SB_A11Y_MODE` (not `process.env.*` — Vite doesn't expose that to the browser bundle)
to switch axe from reporting-only (`todo`) to failing (`error`, used only by the `a11y` check).

## Runtime quality and security checks

Three more check IDs (registered in `scripts/lib/check-registry.mjs`). Unlike `lint`/`typecheck`/`story`/`a11y`,
these are flow-level / repo-wide: a screen naming one runs the same whole-repo command (as `lint`/`typecheck` do).
Not wired into any SelectionSpec's `checksPlanned` yet; a future selection run may add `deps-audit`/`secret-scan`
per-screen.

| Check ID      | Command                | What it does                                                                 | Status |
| ------------- | ----------------------- | ----------------------------------------------------------------------------- | ------------------ |
| `smoke`       | `npm run test:smoke`    | Playwright: boots `next dev`, navigates all 3 golden routes, asserts a route-specific landmark; invoice-list also asserts `?state=` empty/error/loading | **Observational** |
| `deps-audit`  | `npm run audit:deps`    | `npm audit --audit-level=high` (local lockfile). Baseline: moderate advisories pass; a new high/critical fails | **Required-now** |
| `secret-scan` | `npm run scan:secrets`  | `scripts/scan-secrets.mjs`: scans `git ls-files` content for fixed high-confidence secret patterns; allowlist baseline in `scripts/fixtures/secrets-baseline.json` (empty). `scripts/scan-secrets.test.mjs` proves detection | **Required-now** |

- `smoke` is observational because it needs a live `next dev` (slower, port-contention-prone) and inherits the
  Turbopack workspace-root limitation in worktree checkouts. `scripts/run-smoke.mjs` verifies the Chromium binary
  first and exits with a classified `(classification: environment)` + `npm run setup:playwright` guidance if it's
  missing — never a silent skip. Promote to required-now after a clean stability window on a real `node_modules`.
- `a11y` reuses the existing `screenStoryCheck` implementation (no second runner). `components/a11y-fixtures/`
  + `scripts/a11y-known-violation.test.mjs` prove the gate still fails on a real `image-alt` violation.

### Browser setup

Rendered checks (`story`/`a11y`/`smoke`) need Playwright's Chromium binary. Run once after `npm install`, and in
CI before `npm run checks:planned`:

```sh
npm run setup:playwright   # = npm exec playwright install chromium
```

Do not substitute the local Chrome or skip install: `checks:planned` must fail if its browser-backed checks can't run.

Add a `play` function to a `-screen.stories.tsx` story when a check should exercise an interaction, not just render
(see `components/patterns/login-03-screen.stories.tsx`'s `FillAndSubmit` — type via `userEvent`, assert, and avoid
an unhandled native form submit, which navigates and kills the test).

## BuildReport Emission

Write the result to `docs/examples/buildreport-<flowId>.json` and validate it with `npm run validate:spec -- docs/examples/buildreport-<flowId>.json`.

Then run `npm run validate:pipeline` (cross-artifact invariants over FlowSpec + SelectionSpec + this BuildReport; pass `--flow/--spec/--build` if the filenames differ from the defaults). Both must exit 0 before the BuildReport is considered emitted.

**Provenance sidecar invalidation:** the sidecar's registry digest covers all of `registry/`, so adding or editing any registry item makes every existing sidecar fail `npm run validate:provenance` as input drift. After any inventory change, regenerate affected sidecars with `npm run gen:provenance` — do not widen the digest to compensate.
