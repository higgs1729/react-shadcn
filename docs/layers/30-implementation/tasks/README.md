# Implementation-Layer Task Briefs

Self-contained work orders for delegating the implementation layer to executor AIs.
Each brief carries its own context, fixed conventions, numbered requirements, and
runnable acceptance criteria — the executor should not need this conversation's history.

| # | Brief | Builds | Depends on |
|---|---|---|---|
| 01 | [task-01-contract-and-orchestrator.md](task-01-contract-and-orchestrator.md) | `ai-buildreport.schema.json` + orchestrator doc | — |
| 02 | [task-02-install-runner.md](task-02-install-runner.md) | `scripts/install-selection.mjs` | 01 |
| 03 | [task-03-page-composition.md](task-03-page-composition.md) | `app/flows/<flowId>/...` routes | 01, 02 |
| 04 | [task-04-story-generation.md](task-04-story-generation.md) | `scripts/gen-pattern-stories.mjs` + `components/patterns/` stories | 03 |
| 05 | [task-05-check-loop.md](task-05-check-loop.md) | `scripts/run-checks.mjs` + final BuildReport | 01–04 |

Shared ground rules for every executor:

- Input fixture: `docs/examples/selectionspec-dryrun-01.json`. Contracts live in
  `docs/contracts/` and are enforced by `npm run validate` — it must exit 0 when you finish.
- Resolve docs by basename via `scripts/lib/paths.mjs` (`readDoc`); never hardcode
  `docs/` subfolders in scripts.
- Never edit `components/ui/*`, `registry/*.json` facet values (except the one field
  task 04 explicitly writes), `docs/contracts/*` (except the file task 01 creates), or
  anything under `docs/layers/20-selection/`.
- Windows repo: scripts are Node ESM `.mjs`; `spawnSync(..., { shell: true })` for npm/npx.
- Finish by reporting: files created/changed, commands run with exit codes, and any
  requirement you could not satisfy (do not silently narrow scope).
