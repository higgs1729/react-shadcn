# AI Implementation Instructions

Build working code from an already-decided selection. Input is a `SelectionSpec` that passes `npm run validate:spec -- <file>`; output is a `BuildReport` that passes the same command. Screens listed in the SelectionSpec's `unresolved` are copied to the BuildReport's `unresolved` and never built.

## Pipeline

1. **Install registry items** — `node scripts/install-selection.mjs <spec>` (task-02-install-runner.md).
2. **Compose pages** — wire the installed screen pattern and blocks into a route under `app/flows/<flowId>/<stepId>/` (task-03-page-composition.md).
3. **Generate stories** — `node scripts/gen-pattern-stories.mjs <spec>` (task-04-story-generation.md).
4. **Run checks** — `node scripts/run-checks.mjs` (task-05-check-loop.md).

## Fix Loop Policy

If any check fails, fix only files created in steps 2-3 of this pipeline. Never edit `components/ui/*`, `registry/*.json` facets, or `docs/contracts/*`. Then rerun the checks.

Maximum 3 iterations. If still failing after 3 iterations:

- `status: "failed"` if no screen reached `built` with all its checks passing.
- `status: "partial"` if at least one screen is `built` and all checks that touch it pass.

Stop after reaching a terminal status; do not keep iterating.

## BuildReport Emission

Write the result to `docs/examples/buildreport-<flowId>.json` and validate it with `npm run validate:spec -- docs/examples/buildreport-<flowId>.json`.
