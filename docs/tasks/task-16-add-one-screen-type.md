# Task 16: Add one ScreenType end to end

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Add exactly one new ScreenType to the vocabulary, canonical profiles, registry
inventory, and regression coverage so the selection and implementation pipeline can
use it mechanically. This brief is reusable: set the target declaration once, then
complete every work package for that single target before choosing another ScreenType.

## Target declaration

Before editing, replace every value below with a concrete value and include the filled
declaration in the final report. Do not execute this brief while any value is still a
placeholder.

```yaml
TARGET_SCREEN_TYPE: <kebab-case ScreenType name>
PRIMARY_JOB: <one sentence describing the user's primary job on this screen>
DISTINGUISH_FROM: <nearest existing ScreenType and the decisive distinction>
REFERENCE_PRODUCTS: <two or more product/screen references, comma-separated>
```

## Scoped authorization

Vocabulary (screenType / blockRole enums in `docs/contracts/*` + profiles in
`docs/layers/20-selection/*`) is frozen by default. **The executor of this brief may
extend it at its own discretion** — no per-extension human approval; the human audits
periodically. Guardrails: add only (never change/remove existing values), subagents stay
read-only on protected files, and if the target needs a new blockRole rather than just
the one ScreenType, stop and report instead of widening the exception.

## Context

- ScreenType vocabulary is `definitions.screenType.enum` in
  `docs/contracts/ai-design-facets.schema.json`.
- Screen profiles are `screenTypes` entries in
  `docs/layers/20-selection/ai-canonical-profiles.json`. The profile contract is
  `docs/contracts/ai-canonical-profiles.schema.json`.
- Every block role referenced by a screen profile must already exist under
  `blockRoles`, and the role's `screenTypes` must include the new ScreenType. Because
  existing profiles are protected, adding the new ScreenType to an existing block-role
  profile is also part of the coordinator's narrowly authorized profile edit.
- Registry inventory is in `registry/*.json`; facets are under
  `meta.aiDesignSystem`. Use an existing screen-pattern item as the structural example
  and existing standalone block-pattern items for composition roles.
- New registry files and new components/stories may be created. Existing registry facet
  values and `components/ui/*` implementations must not be changed.
- New profiles and registry items begin with `reviewed: false` where supported and
  `maturity: "experimental"`. Human review is required for promotion.
- `scripts/validate-profiles.mjs`, `scripts/validate-facets.mjs`, and
  `scripts/validate-pipeline.mjs` enforce profile, inventory, and cross-artifact
  integrity. `validate-pipeline.mjs` now includes facet-aware semantic invariants
  (RFC 009: `SCREENTYPE_MATCH` etc.), and `npm run report:coverage` reports inventory
  coverage; use both to confirm the new ScreenType is recognized and stocked.
- The current golden flow under `docs/examples/` must remain unchanged. Add isolated
  fixtures/tests outside `docs/examples/` for this ScreenType.

## Delegation plan

The coordinator owns scope, protected-file edits, integration, and final verification.
Delegate work packages only when subagents are available. Give a subagent this brief
alone plus its work-package ID and target declaration; do not rely on conversation
history. Prefer the lowest-capability agent that can complete the package reliably.

### Model assignment

Use the row for the tool running this brief. Model names are explicit so delegation is
repeatable; when an exact model is unavailable, use the fallback in the same row rather
than silently moving a package to a weaker tier. Record the actual model used for every
work package in the final report.

| Work | Codex | Claude Code | Why this tier |
| --- | --- | --- | --- |
| Coordinator | `5.6 Sol`, reasoning `high` | `opus` (pin `claude-opus-4-8` when reproducibility is required) | Owns taxonomy approval, protected edits, integration, and final judgment. |
| WP-A taxonomy research | `5.6 Terra`, reasoning `high` | `sonnet` (pin `claude-sonnet-5`) | Requires comparison and synthesis, but is read-only and independently reviewable. |
| WP-B fixture/test draft | `5.4 Mini`, reasoning `medium` | `haiku` (pin `claude-haiku-4-5-20251001`) | Bounded, mechanical work with executable acceptance tests. |
| WP-C registry/component implementation | `5.6 Terra`, reasoning `high` | `sonnet` (pin `claude-sonnet-5`) | Multi-file coding and API-fit decisions need a coding-capable model. |
| WP-D mechanical review | `5.4 Mini`, reasoning `low` | `haiku` (pin `claude-haiku-4-5-20251001`) | Diff counting and checklist verification are deterministic and read-only. |

Codex fallback order: use `5.6 Terra` for implementation work when `5.6 Sol` is
unavailable, and use `5.4 Mini` for bounded mechanical work. If the 5.6 family is
unavailable, use the GUI's `5.5` for coordinator/implementation work and keep `5.4 Mini`
for WP-B/WP-D. Claude Code fallback order: keep the capability class via the stable
aliases `opus`, `sonnet`, and `haiku`; do not replace WP-A or WP-C with Haiku merely to
reduce cost. As of 2026-07-12, the model policy was checked against the official OpenAI
model catalog and Claude Code model/subagent documentation.

For Claude Code custom subagents, set the frontmatter `model` field to `sonnet` or
`haiku` as assigned above; keep the coordinator session on `opus`. For Codex, use the
corresponding reusable definition under `.agents/` and pass its `model`,
`reasoning_effort`, and `agent_type` to the sub-agent runner. The current Codex
sub-agent surface exposes `gpt-5.6-luna` but not `gpt-5.4-mini`; use Luna for WP-B/WP-D
in that surface and record the actual model. If the runner is unavailable, execute
WP-A through WP-D sequentially and report that model isolation was unavailable.

1. **WP-A: taxonomy research (low-cost, read-only).** Inspect current facet vocabulary,
   profiles, and inventory. Return a proposed profile, nearest-type comparison, reused
   block roles, inventory gaps, and evidence URLs. Do not edit files.
2. **WP-B: fixture and test draft (low-cost).** After the coordinator approves the
   proposed profile, draft isolated positive/negative fixture changes proving the enum,
   profile, and registry item are recognized. Do not edit protected files or golden
   artifacts.
3. **WP-C: registry/component implementation (medium capability).** Create the new
   experimental screen-pattern registry item and only the missing components, stories,
   or existing-role block-pattern items needed for a minimal working screen. Do not
   alter existing facets or primitives.
4. **WP-D: mechanical review (low-cost, read-only).** Compare the completed diff against
   this brief, check that exactly one ScreenType was added, and report omissions or
   unrelated changes.

WP-A must complete before protected-file edits. WP-B and WP-C may run in parallel after
the profile is approved. The coordinator resolves conflicts, performs all protected-file
edits, and reruns every acceptance command. If delegation is unavailable, execute the
same packages sequentially and record that fact; do not omit a package.

## Requirements

1. Produce a short taxonomy decision from WP-A showing why `TARGET_SCREEN_TYPE` is not
   adequately represented by an existing ScreenType. Include its primary intent,
   job-map stages, data shapes, interaction models, density, typical roles, optional
   roles, and at least two evidence references.
2. Add exactly `TARGET_SCREEN_TYPE` to the ScreenType enum. Preserve all existing enum
   values and ordering; append the new value unless the file has an explicit ordering
   convention that requires another position.
3. Add exactly one matching `screenTypes[TARGET_SCREEN_TYPE]` profile. Keep it
   `maturity: "experimental"` and not human-reviewed. Use only existing facet enums and
   existing block roles. Update each referenced block-role profile's `screenTypes`
   array symmetrically without changing its other claims.
4. Add at least one new experimental `screen-pattern` registry item whose `screenType`
   equals `TARGET_SCREEN_TYPE`. Its composition must list standalone block roles and
   every required role must have at least one compatible block-pattern item in
   inventory.
5. Reuse existing block-pattern items where their facets and component API genuinely
   fit. For an uncovered required role, create a new block-pattern item only for an
   already-defined blockRole, with its own component and Storybook story. Do not add a
   new blockRole vocabulary in this task.
6. Ensure the new screen pattern declares real files, dependencies, state coverage,
   evidence, risk, and verification metadata according to the facets contract. Do not
   claim checks or states that are not implemented.
7. Add focused regression coverage proving: the new enum value validates; its profile
   passes referential/symmetry checks; its registry item passes facet validation; and a
   SelectionSpec using the new ScreenType with a wrong-type screen pattern is rejected
   by cross-artifact validation when Task 15 semantics are present. Tests must derive
   expected vocabulary dynamically rather than hardcoding the old counts of 10
   ScreenTypes or 30 blockRoles.
8. Add a minimal runnable screen or isolated composition fixture for the new pattern so
   its story mounts. Do not add it to the existing golden flow. Read the relevant local
   Next.js guide in `node_modules/next/dist/docs/` before creating or changing a route.
9. Run WP-D after implementation. The final diff must add exactly one ScreenType, no new
   blockRole enum, no maturity promotion, no existing registry facet edits, and no
   unrelated refactor.
10. Update `docs/STATUS.md` only after all checks pass, recording the new experimental
    ScreenType, its inventory item, remaining gaps, and the next candidate without
    retaining a change history.

## Constraints

- One execution adds one ScreenType. Never batch multiple ScreenTypes.
- Do not weaken schemas, validators, thresholds, or fail-closed behavior to make the new
  data pass.
- Do not modify existing golden FlowSpec, SelectionSpec, BuildReport, or provenance
  files; the new inventory will invalidate provenance digest temporarily, so regenerate
  the affected sidecar only if the repository's required validation command demands it.
- Do not promote any existing or new item to `canonical` or `recommended`.
- Do not install a new dependency when an existing primitive or package can implement
  the pattern. Report unavoidable dependency additions explicitly.
- Do not read `docs/archive/`.

## Acceptance criteria

- [ ] `git diff -- docs/contracts/ai-design-facets.schema.json` shows one added
      ScreenType enum value and no other contract change.
- [ ] The canonical profile contains exactly one new screen profile, all referenced
      roles exist, and role-to-screen symmetry is complete.
- [ ] `npm run validate:schemas`, `npm run validate:profiles`, and
      `npm run validate:facets` each exit 0.
- [ ] `npm run test:pipeline` and `npm run validate:pipeline` each exit 0; when Task 15
      is present, regression output covers `SCREENTYPE_MATCH` for the new type.
- [ ] The new screen-pattern story builds and mounts without runtime exceptions.
- [ ] `npm run report:coverage` exits 0 and reports at least one item for
      `TARGET_SCREEN_TYPE`, when that command exists.
- [ ] `npm run validate` and `npm run checks` both exit 0.
- [ ] WP-D reports exactly one ScreenType added, zero new blockRole enum values, zero
      maturity promotions, and zero edits to existing registry facet values.
- [ ] `docs/STATUS.md` names the new experimental ScreenType and its inventory state.

## Out of scope

- Adding a second ScreenType or any new blockRole vocabulary.
- Promoting maturity or setting human-review approval.
- Reworking selection scoring weights or tie-breaking rules.
- Generalizing story generation for all possible component APIs.
- Adding the ScreenType to the existing golden flow.
- Committing or pushing changes.
