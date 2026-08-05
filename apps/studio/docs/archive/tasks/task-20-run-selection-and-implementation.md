# Task 20: Run selection and implementation for one FlowSpec

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Take one already-authored FlowSpec through the two downstream layers — **20-selection**
(FlowSpec → SelectionSpec) then **30-implementation** (SelectionSpec → BuildReport + code) —
producing a complete, cross-validated `docs/examples/` triple and the dogfooded screen
routes for the resolved steps. The two layers are one continuous pipeline: the SelectionSpec
this task emits is the exact input the implementation phase consumes, so both run under a
single brief.

## Target declaration

Before executing, replace every value below with a concrete value and include the filled
declaration in the final report. Do not execute while any value is a placeholder.

```yaml
TARGET_FLOW_ID: <flowId, e.g. studio-portfolio-01>
UPSTREAM_FLOWSPEC: docs/layers/10-upstream/flowspec-<TARGET_FLOW_ID>.json
EXPECTED_UNRESOLVED: <steps expected to lack stocked screen-patterns, or "none" if inventory is fully stocked>
```

## Context

- **The two layer instruction docs are the authoritative procedure of record; do not
  reinvent their scoring, thresholds, or output shapes.** Read them in full before acting:
  - Selection: `docs/layers/20-selection/ai-pattern-selection-instructions.md`
    (scoring formula, per-step procedure, selection rules, self-review loop).
  - Implementation: `docs/layers/30-implementation/ai-implementation-instructions.md`
    (install → compose → stories → checks pipeline, fix-loop policy, planned checks,
    BuildReport emission, provenance).
- Contracts: `docs/contracts/ai-flowspec.schema.json`, `ai-selectionspec.schema.json`,
  `ai-buildreport.schema.json`. Facet vocabulary: `ai-design-facets.schema.json`. Canonical
  screen/block profiles: `docs/layers/20-selection/ai-canonical-profiles.json`.
- **Triple co-location invariant.** `scripts/lib/flows.mjs` discovers flow triples by
  scanning `docs/examples/` only, and fails loud (`Incomplete flow triple`) unless all three
  contract kinds for a `flowId` are present there. The target FlowSpec currently lives under
  `docs/layers/10-upstream/` (its authored home). Phase A must copy it verbatim to
  `docs/examples/flowspec-<TARGET_FLOW_ID>.json` so the pipeline validators can find the
  triple. Keep both copies byte-identical; 10-upstream stays the upstream source, `examples`
  holds the in-pipeline copy.
- **Partial builds are a valid terminal outcome.** Steps whose resolved `screenType` has no
  stocked, compatible `screen-pattern` (or an unbroken tie, or missing dependencies) go to
  the SelectionSpec's `unresolved`, are copied to the BuildReport's `unresolved`, and are
  never built. The existing golden flow `dryrun-saas-ops-01` is itself designed to exercise
  `unresolved`. Do not force a low-confidence pick to avoid `unresolved`.
- Worked example of a complete triple: `docs/examples/flowspec-dryrun-saas-ops-01.json`,
  `selectionspec-…`, `buildreport-…`, plus its `buildreport-…provenance.json` sidecar.
- Pipeline commands (all Node ESM `.mjs`): `scripts/install-selection.mjs`,
  `scripts/gen-pattern-stories.mjs`, `scripts/run-checks.mjs`, `scripts/run-planned-checks.mjs`,
  `scripts/gen-provenance.mjs`; validators `npm run validate:spec`, `validate:pipeline`,
  `validate:provenance`.
- Routes are composed under `app/flows/<TARGET_FLOW_ID>/<stepId>/`. Read the relevant local
  Next.js guide in `node_modules/next/dist/docs/` before creating or changing a route.

## Phases

### Phase A — Selection (20-selection)

Execute `docs/layers/20-selection/ai-pattern-selection-instructions.md` against
`UPSTREAM_FLOWSPEC` end to end: resolve each step's `screenType`, retrieve and score screen
patterns, read required block roles from the chosen pattern's `composition.requiredBlocks`,
select a block pattern per role, and run the doc's "Self-Review Before Emitting" loop. Emit
`docs/examples/selectionspec-<TARGET_FLOW_ID>.json` and validate it with
`npm run validate:spec -- <file>` (must exit 0). Also perform the triple-co-location copy of
the FlowSpec (see Context). Do not run implementation-layer checks in this phase.

### Phase B — Implementation (30-implementation)

Execute `docs/layers/30-implementation/ai-implementation-instructions.md` against the
Phase A SelectionSpec: install selected registry items, compose one route per resolved step
under `app/flows/<TARGET_FLOW_ID>/<stepId>/`, generate stories, and run both check runners
under the fix-loop policy (max 3 iterations; terminal `built`/`partial`/`failed`). Emit
`docs/examples/buildreport-<TARGET_FLOW_ID>.json`, copying the SelectionSpec's `unresolved`
forward unchanged. Validate with `npm run validate:spec -- <file>` and `npm run validate:pipeline`.
Regenerate the provenance sidecar with `npm run gen:provenance` and confirm
`npm run validate:provenance`.

## Delegation plan

The coordinator owns scope, the triple-co-location copy, the `docs/STATUS.md` edit,
integration, and final verification. Delegate the two phase executors and the reviewer only
when subagents are available. Give a subagent this brief plus its work-package ID and the
filled target declaration; do not rely on conversation history. Phases are strictly
sequential (B consumes A's SelectionSpec); the review runs after B.

### Model assignment

**First identify which tool is running this brief, then read only that tool's subsection
and skip the other.** Both subsections assign the same capability tiers to the same work
packages; they differ only in model names and launch mechanics. Shared rationale:

| Work package | Capability tier | Why |
| --- | --- | --- |
| Coordinator | highest | Owns the co-location copy, protected `STATUS` edit, integration, and final judgment across both layers. |
| WP-A selection | high | Mechanical but subtle scoring/tie-breaking; a wrong resolve corrupts everything downstream. |
| WP-B implementation | high (coding) | Multi-file coding, route composition, and the check fix-loop need a coding-capable model. |
| WP-C review | low (read-only) | Deterministic diff/artifact verification against the brief. |

Record the actual model used for every work package in the final report.

#### If you are Claude Code — read this, skip the Codex subsection

The work packages are predefined subagents under `.claude/agents/`. Launch each with the
Agent tool, setting `subagent_type` to the name below; the model is pinned in frontmatter.

| Work package | `subagent_type` | Model |
| --- | --- | --- |
| Coordinator | `pipeline-coordinator` | `opus` (pin `claude-opus-4-8`) |
| WP-A | `pipeline-selection` | `sonnet` (pin `claude-sonnet-5`) |
| WP-B | `pipeline-implementation` | `sonnet` (pin `claude-sonnet-5`) |
| WP-C | `pipeline-review` | `haiku` (pin `claude-haiku-4-5-20251001`) |

Fallback: keep the capability class via the stable aliases; do not drop WP-A/WP-B to `haiku`
merely to reduce cost. If the Agent tool is unavailable, execute WP-A→WP-C yourself
sequentially and report that model isolation was unavailable.

#### If you are Codex — read this, skip the Claude Code subsection

Use the reusable definition under `.agents/` for each work package and pass its `model`,
`reasoning_effort`, and `agent_type` to the sub-agent runner.

| Work package | `.agents/` definition | Model | Reasoning | Agent type |
| --- | --- | --- | --- | --- |
| Coordinator | `pipeline-coordinator.md` | `gpt-5.6-sol` | `high` | `default` |
| WP-A | `pipeline-selection.md` | `gpt-5.6-terra` | `high` | `worker` |
| WP-B | `pipeline-implementation.md` | `gpt-5.6-terra` | `high` | `worker` |
| WP-C | `pipeline-review.md` | `gpt-5.6-luna` | `low` | `explorer` |

Fallback: use `gpt-5.6-terra` for both phase executors; `gpt-5.4-mini` is the preferred cost
target for WP-C when the surface exposes it, otherwise `gpt-5.6-luna`. If the runner is
unavailable, execute WP-A→WP-C sequentially and report that model isolation was unavailable.

#### Work packages (both tools)

1. **WP-A: selection (high).** Run Phase A per the selection instructions. Output the
   validated SelectionSpec and the FlowSpec co-location copy. Do not build code.
2. **WP-B: implementation (high, coding).** Run Phase B per the implementation instructions.
   Compose routes for resolved steps, generate stories, run the check fix-loop, emit and
   validate the BuildReport, regenerate provenance. Do not edit protected files or the
   SelectionSpec's resolved decisions.
3. **WP-C: review (low, read-only).** Verify the emitted triple against this brief: every
   FlowSpec step is either resolved-and-built or in both `unresolved` lists; no protected
   file changed; no maturity promotion; routes exist only for resolved steps. Report
   omissions and unrelated changes only; do not edit files.

## Requirements

1. Copy `UPSTREAM_FLOWSPEC` verbatim to `docs/examples/flowspec-<TARGET_FLOW_ID>.json` (byte
   identical), forming the pipeline triple's FlowSpec member.
2. Produce `docs/examples/selectionspec-<TARGET_FLOW_ID>.json` by executing the selection
   instructions mechanically. Every FlowSpec step is resolved to one `screenType` with a
   scored screen pattern and per-role block selections, or is listed in `unresolved` with a
   reason. Block roles come from the chosen pattern's `requiredBlocks`, not raw facets. Every
   selected item scores at or above the doc's thresholds; rejected alternatives and
   assumptions are recorded.
3. Produce `docs/examples/buildreport-<TARGET_FLOW_ID>.json` by executing the implementation
   instructions. Every resolved step becomes a route under `app/flows/<TARGET_FLOW_ID>/<stepId>/`
   whose story mounts; the SelectionSpec's `unresolved` is copied forward unchanged.
4. The BuildReport's terminal `status` honestly reflects the fix-loop outcome
   (`built`/`partial`/`failed`); do not claim checks or states that did not run/pass.
5. Regenerate the provenance sidecar for the new flow (`npm run gen:provenance`) and keep the
   existing golden flow's artifacts and sidecar unchanged; regenerate only sidecars actually
   invalidated by this task's inventory/triple changes.
6. Update `docs/STATUS.md` only after all acceptance commands pass, recording the new flow's
   triple, its `built`/`partial` status, and which steps remain `unresolved` and why —
   without retaining a change history.

## Constraints

- The selection and implementation instruction docs are authoritative. Do not alter their
  scoring weights, thresholds, tie-breaking, or output schemas to make data pass.
- Never edit `components/ui/*`, `registry/*.json` facet values, `docs/contracts/*`, or
  anything under `docs/layers/20-selection/`. During the implementation fix-loop, edit only
  files this task created (compositions and generated stories); the sole sanctioned registry
  write is `gen-pattern-stories.mjs` writing back `verification.storybookStories`.
- Do not stock inventory or add/alter any `screenType`/`blockRole` vocabulary or profile. If
  a step cannot resolve because inventory is missing, leave it `unresolved` and name the gap;
  inventory work belongs to Task 16/18/19, not here.
- Do not hand-build the portfolio application shell (global navigation, root routes, i18n
  locale segments, Storybook deep-linking). That host surface is a separate future task; this
  task produces only the pipeline's `app/flows/<TARGET_FLOW_ID>/<stepId>/` routes.
- Do not promote any item to `canonical`/`recommended`, and do not modify the existing golden
  flow triple.
- Do not install a new dependency when an existing primitive or package suffices; report any
  unavoidable addition.
- Do not read `docs/archive/`.

## Acceptance criteria

A run has one terminal outcome: a completed pipeline run satisfies the full checklist; a run
blocked entirely by missing inventory still emits a valid triple whose steps are all
`unresolved` with named gaps, and satisfies every criterion except per-step route existence.

- [ ] `docs/examples/flowspec-<TARGET_FLOW_ID>.json` exists and is byte-identical to
      `UPSTREAM_FLOWSPEC`.
- [ ] `npm run validate:spec -- docs/examples/selectionspec-<TARGET_FLOW_ID>.json` exits 0.
- [ ] `npm run validate:spec -- docs/examples/buildreport-<TARGET_FLOW_ID>.json` exits 0.
- [ ] `npm run validate:pipeline` exits 0 (cross-artifact invariants over the new triple,
      including facet-aware semantic checks).
- [ ] `npm run validate` and `npm run checks` both exit 0.
- [ ] `npm run validate:provenance` exits 0 after `npm run gen:provenance`.
- [ ] Every resolved step has a route under `app/flows/<TARGET_FLOW_ID>/<stepId>/` whose story
      mounts without runtime exceptions; every step in the SelectionSpec `unresolved` list is
      also in the BuildReport `unresolved` list, and has no route.
- [ ] WP-C reports zero protected-file edits, zero maturity promotions, zero portfolio-shell
      files, and no route for any `unresolved` step.
- [ ] `docs/STATUS.md` names the new flow triple and its per-step resolved/unresolved state.

## Out of scope

- Authoring or editing the FlowSpec content (that is upstream; this task only copies it).
- Stocking inventory or adding any `screenType`/`blockRole` vocabulary or profile.
- Building the portfolio application shell: global nav, root/section routes, JA/EN i18n, or
  Storybook deep-linking.
- Promoting maturity or setting human-review approval.
- Reworking selection scoring or implementation check definitions.
- Committing or pushing changes.
