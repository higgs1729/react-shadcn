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

## Execution permission failures (Codex sandbox)

In Codex Desktop, a command can be correct yet fail with `EPERM`, `EACCES`, or
`operation not permitted` because the sandbox blocks a tool-created temporary or output
file. Treat this as an execution-environment failure only when the denied path is one of
the command's expected generated locations, for example:

- Next.js build output such as `.next/trace`.
- Vite / Storybook temporary caches such as `node_modules/.vite-temp/` or
  `node_modules/.cache/storybook/`.
- A requested generated artifact, such as a provenance sidecar under `docs/examples/`.

Use this decision sequence:

1. Preserve the exact command and the denied path in the report. Do not change source code,
   weaken the check, or substitute a different command merely to avoid the write.
2. Rerun that same, narrowly scoped command with an explicit elevated-permission request.
   The request must say what generated directory/file it needs and why; prefer a command
   prefix limited to that check. Do not request broad shell or filesystem permission.
3. If the elevated rerun passes, report the initial failure as a sandbox restriction and the
   elevated result as the authoritative check result.
4. If the denied path is a source file, a protected file, or an unexpected location, stop and
   escalate to the coordinator/user instead of assuming write permission. Likewise, a real
   test, type, lint, build, or a11y failure remains a product failure even when an earlier
   sandbox failure also occurred.
5. If elevated execution is unavailable, report the command, exact error, and blocked output
   path as an unsatisfied requirement. Never claim a skipped browser/build/provenance check
   passed.

Build and browser checks normally write caches even when their user-visible purpose is
verification. After a successful elevated run, continue with the task's ordinary validation
and provenance steps; elevation does not bypass any repository rule.

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
