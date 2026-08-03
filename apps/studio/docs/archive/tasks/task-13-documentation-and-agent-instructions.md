# Task 13: Clarify the README and synchronize agent instructions

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Replace the template-oriented repository entry point with concise project documentation, and make
the relationship between `AGENTS.md` and `CLAUDE.md` mechanically reviewable so agent guidance does
not drift.

## Context

- `README.md` is still primarily the Next.js/shadcn template introduction.
- `AGENTS.md` and `CLAUDE.md` provide agent rules. `docs/STATUS.md` says their content must be
  updated together.
- The project pipeline is brief → JTBD → FlowSpec → SelectionSpec → implementation → BuildReport.
  Current contracts live in `docs/contracts/`, instructions in `docs/layers/`, task briefs in
  `docs/tasks/`, RFC rationale in `docs/rfcs/`, and current examples in `docs/examples/`.
- Do not read `docs/archive/`; it is not needed for this task.

## Requirements

1. Rewrite the root README as a human-oriented entry point containing: purpose, pipeline overview,
   repository map, quick-start commands, current golden flow, validation commands, human approval
   boundaries, and links to STATUS, RFCs, task briefs, contracts, and implementation guidance.
2. Preserve the existing agent rules' meaning while choosing and documenting one synchronization
   mechanism for `AGENTS.md` and `CLAUDE.md`: a canonical shared source generated into both files,
   or a deterministic comparison command that fails on meaningful drift.
3. Implement the selected synchronization/check mechanism and expose it through an `npm` command.
   It must run offline and produce a focused diff or error when the two instruction files diverge.
4. Keep root-level instructions concise. If path-specific instructions are not yet justified, record
   explicit adoption criteria instead of adding empty instruction files.
5. Update STATUS or documentation references required by the chosen mechanism so a new human or
   agent can discover it without conversation history.

## Constraints

- Do not delete project-specific instructions in either current instruction file.
- Do not change contracts, canonical profiles, registry facet values, or archived documents.
- Do not assert support for an AI product unless the repository file format actually supports it.

## Acceptance criteria

- [ ] README identifies the project purpose, pipeline, first validation commands, and human-only
  approval boundaries without relying on external conversation context.
- [ ] The instruction-sync command exits 0 for the committed files and exits non-zero with a focused
  diagnostic when given a deliberately divergent copy.
- [ ] `npm run validate` and `npm run checks` exit 0.

## Out of scope

- Creating path-specific instruction files throughout the repository.
- Writing vendor-specific agent prompts beyond the current AGENTS/CLAUDE compatibility scope.
