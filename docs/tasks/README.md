# Task Briefs

Self-contained work orders for delegating work in any layer to executor AIs.
Each brief carries its own context, numbered requirements, and runnable acceptance
criteria — the executor should not need the orchestrator's conversation history.

Lifecycle: the orchestrator AI writes a brief here (following the template below) →
hands the executor that one file → independently verifies the result → moves the
completed brief to `docs/archive/tasks/`. This folder holds only briefs that are
currently pending or in flight.

## Shared ground rules for every executor

Briefs reference this section instead of restating it. Read it before starting.

- Contracts live in `docs/contracts/` and are enforced by `npm run validate` — it must
  exit 0 when you finish.
- Resolve docs by basename via `scripts/lib/paths.mjs` (`readDoc`); never hardcode
  `docs/` subfolders in scripts.
- Never edit `components/ui/*`, `registry/*.json` facet values, `docs/contracts/*`, or
  anything under `docs/layers/20-selection/`.
- This repo uses base-ui, not Radix: `asChild` and `type="single"` do not exist;
  composition is `render={<.../>}`. When unsure about a component API, read its source
  in `components/ui/`.
- Windows repo: scripts are Node ESM `.mjs`; `spawnSync(..., { shell: true })` for npm/npx.
- Do not read or reference `docs/archive/`.
- Finish by reporting: files created/changed, commands run with exit codes, and any
  requirement you could not satisfy (do not silently narrow scope).

## Brief template

The orchestrator generates each brief from this template. Rules for filling it in:

- File name: `task-NN-<kebab-slug>.md` (NN continues the sequence in `docs/archive/tasks/`).
- Keep the first line (`Prerequisite`) verbatim — it replaces restating the ground rules.
- Every Requirement must be independently checkable; every Acceptance criterion must be
  a runnable command or an observable fact, with expected outcome.
- Include in Context every repo fact the executor needs that is not in the ground
  rules — target file paths, contract names, existing patterns to imitate. Do not
  assume the executor knows anything from the orchestrator's conversation.
- Omit a section only if it is genuinely empty; do not merge sections.

```markdown
# Task NN: <imperative title>

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective
<1–3 sentences: what to accomplish and why. Single most important outcome.>

## Context
- <repo facts the executor needs: relevant paths, contracts, patterns to imitate>
- <current state vs. desired state, if applicable>

## Requirements
1. <concrete, independently checkable statement>
2. <...>

## Constraints
- <task-specific things NOT to do, beyond the shared ground rules>

## Acceptance criteria
- [ ] <runnable command + expected result, e.g. `npm run validate` exits 0>
- [ ] <observable fact, e.g. file X exists and validates against schema Y>

## Out of scope
- <explicitly excluded work, to prevent scope creep>
```
