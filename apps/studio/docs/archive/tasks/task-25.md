<!-- encoding:UTF-8 -->
<!-- Task ID: 25 -->

# Task 25: Propose the hierarchical golden-flow migration

- Status: complete
- Created: 2026-07-16
- Owner: executor
- Source: user request
- Depends on: none
- Source playbook: none
- taskLevel: 9
- reasoningLevel: 10

## Objective

Propose a reviewed migration from flat one-screen steps to an owned hierarchy of `Page`,
`ChildRoute`, `Drawer`, and `Dialog`. Produce an RFC with alternatives, a recommended architecture,
compatibility policy, and implementation work packages; do not change contracts or code
until the human owner approves the design.

## Desired outcome and invariants

- One application-level source of truth owns entity hierarchy and composition references.
- Owner, route, open-trigger, and state relationships are machine-validatable.
- Reused registry assets, shared composition definitions, and runtime state instances remain
  distinct concepts.
- Human+AI design decisions are separated from deterministic scoring, generation, and checks.

## Inputs and prerequisites

- Read-only inputs: current contracts, layer instructions, Studio specification, examples,
  validators, route/story generators, and registry metadata.
- Start gate: `docs/STATUS.md` and recent git history have been reconciled, and all relevant
  uncommitted changes are identified before RFC research begins.

## Context

- The current FlowSpec contract (`docs/contracts/ai-flowspec.schema.json`) defines every
  `steps[]` item as exactly one screen. It carries facet signals and transitions, but has no
  UI-entity kind, parent ownership, shared composition identity, or transient-surface model.
- The current SelectionSpec (`docs/contracts/ai-selectionspec.schema.json`) resolves one
  screen pattern and its blocks per `stepId`. It can repeat the same registry item across
  steps, but cannot state that a Drawer/Dialog is owned by a Page or that a composition is
  shared across several UI entities.
- `docs/apps/studio/studio-app-spec.json` is the current application source of truth. It
  already separates `pages`, `entryPages`, `childRoutes`, `drawers`, `dialogs`, and
  `popovers`; each transient surface has a `parentPage`. `docs/apps/studio/README.md` and
  `architecture.md` describe the same hierarchy.
- The Studio app was restructured after flat golden-flow generation produced inconsistent
  compositions for patterns such as a list Page with a detail Drawer or a settings Dialog.
  The new golden-flow model must represent those relationships directly instead of trying
  to recover them from screen-level `transitions`.
- Existing registry patterns remain reusable inventory. This task must not change existing
  registry facet values or `components/ui/*`.
- Current mechanical tooling includes `scripts/select-candidates.mjs` (candidate scoring
  only), `scripts/install-selection.mjs`, `scripts/gen-flow-routes.mjs`,
  `scripts/gen-pattern-stories.mjs`, and `scripts/validate-pipeline.mjs`. Update or replace
  only the tools that must change for the new contracts; do not claim full automation where
  an AI/human composition decision remains necessary.

## Authority and approvals

- Executor may inspect the current contracts, Studio specification, validators, and
  generators read-only and may author one proposed RFC under `docs/rfcs/`.
- Executor owns evidence reconciliation, self-review, and the final recommendation.
- Human approval is required for the chosen architecture, compatibility policy, edits to
  `docs/contracts/*` or `docs/layers/20-selection/*`, and the start of implementation.
- Protected-path exception: none. This task cannot override repository-level prohibitions.

## Review and decision plan

- Compare at least three alternatives: extend FlowSpec into an entity union; add a generic
  AppSpec above FlowSpec; or generalize studioAppSpec with an explicit legacy adapter.
- Evaluate single-source-of-truth quality, ownership validity, reuse semantics, backward
  compatibility, migration cost, deterministic generation, and Studio-specific coupling.
- Perform a structured self-review against every alternative and source-of-truth claim, and
  record findings and dispositions in the RFC. A human review remains the decision gate;
  no second executor is required.

## Migration requirements for the proposal

The RFC must address every item below. These are requirements for later implementation work
packages, not authorization to implement them in this task.

1. **R1** — Define a versioned application-flow input contract whose root is an application spec and
   whose UI entities are typed as `Page`, `ChildRoute`, `Drawer`, or `Dialog`. Each entity
   must have a stable ID; ChildRoute/Drawer/Dialog must declare an owning Page or layout;
   and routes must be required only for routable entities.
2. **R2** — Model the relationship between an entity and its selected composition explicitly. The
   contract must distinguish reusing a selected screen pattern, composing existing blocks,
   and an intentional override. It must support one reusable block/pattern appearing in
   multiple entities without treating those occurrences as independent shared instances.
3. **R3** — Make `studioAppSpec` the application-level source of truth for the Studio golden flow.
   Consolidate or remove duplicated, conflicting hierarchy declarations in FlowSpec,
   SelectionSpec, generated data, and route-generation conventions. Do not require a
   runtime AI service or runtime contract generation.
4. **R4** — Redesign SelectionSpec and BuildReport to address UI entities (not only flat `stepId`s),
   preserve selection rationale/assumptions/risks/state plans, and report build and
   verification results for both routable and transient entities.
5. **R5** — Define how a Drawer/Dialog opens from its owner, how URL state is represented when
   needed, and how ownership/route validity are validated. A transient entity must not be
   independently generated as a top-level route unless its entity type explicitly permits
   it.
6. **R6** — Retain a mechanical boundary after the hierarchy and composition choices are decided:
   candidate scoring may be deterministic decision support; route wrappers, installation,
   stories, and checks should be generated from the resolved contract where applicable.
   Document the remaining human+AI decisions, including application hierarchy and content
   composition.
7. **R7** — Add schema and pipeline validation that rejects at least: unknown owners, invalid
   entity-type/route combinations, duplicate entity IDs, invalid references to a selected
   composition, and unresolved entities reported as built.
8. **R8** — Migrate the Studio golden-flow fixtures and their provenance/build evidence to the new
   model. Keep the existing curated example-app artifacts working unless their migration is
   explicitly required by the new contract; document any compatibility boundary.
9. **R9** — Update the relevant layer instructions, Studio documentation, route/story generators,
   validation tests, and generated data so they all describe and enforce the same model.

## Constraints

- This task changes only its active task file and one proposed RFC. It does not edit schemas,
  selection instructions, generators, fixtures, provenance, registry, or application code.
- Treat this as a contract migration: design the schemas, fixtures, generators, and
  validators together. Do not add optional fields to the old flat FlowSpec as a substitute
  for ownership and entity typing.
- Preserve existing `screenType` / `blockRole` vocabulary and maturity policy. New
  application-level entity vocabulary must not mutate existing registry facet values.
- The Studio UI remains a static presentation of curated artifacts. It must not imply that
  an end user can run the golden flow or generate an app at runtime.
- If compatibility with existing flat flow artifacts is retained, make the adapter/version
  boundary explicit and validate it. Do not silently reinterpret a flat `stepId` as a
  parent-owned transient entity.
- Before editing Next.js routes or route-generation code, read the relevant guide under
  `node_modules/next/dist/docs/` as required by the repository root instructions.

## Acceptance criteria

- [ ] **AC1 (R1–R9)** — One proposed RFC records the current-state evidence, all three alternatives,
      evaluation criteria, recommendation, trade-offs, and unresolved human decisions.
- [ ] **AC2 (R1–R5)** — The proposed model defines entity IDs, ownership, route rules, open triggers,
      URL state, composition modes, and the difference between asset reuse, shared
      composition definitions, and runtime state instances.
- [ ] **AC3 (R6–R9)** — The RFC states the manual/human+AI/mechanical boundary and a versioned
      migration, validation, provenance, compatibility, and rollback strategy.
- [ ] **AC4** — Self-review findings and dispositions are recorded before a preferred
      alternative is presented for human approval.
- [ ] **AC5 (R7–R9)** — The RFC decomposes later implementation into dependency-ordered work packages
      for contracts+validators, tooling, Studio migration, and documentation+provenance.
- [ ] **AC6** — `git diff -- docs/contracts docs/layers/20-selection registry app components scripts`
      produces no output for this task.
- [ ] **AC7** — `npm run validate:agents` and `git diff --check` exit 0.

## Verification

| Command or inspection | Proves | Expected result |
| --- | --- | --- |
| `npm run validate:agents` | AC7 | exit 0 |
| `git diff --check` | AC7 | exit 0 |
| `git diff -- docs/contracts docs/layers/20-selection registry app components scripts` | AC6 | no output |
| RFC requirements/review matrix inspection | AC1–AC5 | every requirement has evidence, a decision, or an explicit unresolved item |

## Terminal outcomes

- Review-ready: the proposed RFC, comparison, self-review, and work-package plan are
  complete; keep this task active while awaiting human judgment.
- Complete: the human owner records an accepted or rejected decision and its rationale.
- Blocked: source-of-truth conflicts cannot be resolved read-only, self-review cannot be
  completed, or a required human decision is missing. Leave no protected or code changes.

## Out of scope

- Implementing the migration before the RFC is accepted.
- Adding new screen patterns, block patterns, ScreenTypes, or blockRoles.
- Changing the visual design or interaction behavior of existing Studio or example-app UI
  except where a generated route/panel binding must change to satisfy the new hierarchy.
- A runtime app generator, backend integration, or a runtime AI service.
- Committing or pushing changes.

## Completion handoff

Report the RFC path, alternatives, recommendation, self-review findings, unresolved human
decisions, changed files, and command exit codes. The executor archives this
task only after the human decision is recorded.

## Human decision

- Decision date: 2026-07-16
- Decision: Rejected for now. Do not migrate the golden-flow contracts to a hierarchical application model.
- Rationale: The required application-level hierarchy, routing, activation, composition, compatibility, and tooling migration are too broad for the current phase. Keep the existing flat golden flow in partial use and build Team T as a separate application route that reuses the inventory where it fits.
- Follow-up boundary: Use the current system for candidate discovery, selected route-level screens, component reuse, states, and checks. Do not treat it as the Team T application-structure source of truth.
