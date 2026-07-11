# Implementation-Layer Task Briefs

Self-contained work orders for delegating the implementation layer to executor AIs.
Each brief carries its own context, fixed conventions, numbered requirements, and
runnable acceptance criteria — the executor should not need this conversation's history.

Lifecycle: the orchestrator AI writes a brief here → hands the executor that one file →
independently verifies the result → moves the completed brief to `docs/archive/tasks/`.
This folder holds only briefs that are currently pending or in flight.

Completed briefs (archived): tasks 01–06 and rerun-02, in `docs/archive/tasks/` and git
history. They double as templates for new briefs.

Shared ground rules for every executor:

- Contracts live in `docs/contracts/` and are enforced by `npm run validate` — it must
  exit 0 when you finish.
- Resolve docs by basename via `scripts/lib/paths.mjs` (`readDoc`); never hardcode
  `docs/` subfolders in scripts.
- Never edit `components/ui/*`, `registry/*.json` facet values, `docs/contracts/*`, or
  anything under `docs/layers/20-selection/`.
- Windows repo: scripts are Node ESM `.mjs`; `spawnSync(..., { shell: true })` for npm/npx.
- Finish by reporting: files created/changed, commands run with exit codes, and any
  requirement you could not satisfy (do not silently narrow scope).
