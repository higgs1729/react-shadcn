# Task 18: Stock one existing blockRole

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Add exactly one standalone experimental block-pattern for an existing blockRole that
currently has no compatible registry inventory. Do not change any vocabulary or
canonical profile.

## Target declaration

```yaml
TARGET_BLOCK_ROLE: <existing blockRole enum value>
PRIMARY_JOB: <one sentence describing what this block does>
REFERENCE_PATTERN: <closest existing component or external reference>
TARGET_SCREEN_TYPES: <comma-separated existing ScreenTypes that consume it>
```

## Context

- Existing blockRole vocabulary is `definitions.blockRole.enum` in
  `docs/contracts/ai-design-facets.schema.json`.
- Canonical role profiles are under `blockRoles` in
  `docs/layers/20-selection/ai-canonical-profiles.json`.
- Inventory is `registry/*.json`; a stocked role has at least one item with
  `assetKind: "block-pattern"` and a matching `blockRole`.
- `npm run report:coverage` is the inventory report. If the target is already stocked,
  stop and report the existing item rather than creating a duplicate without a distinct
  API or use case.
- New files may be added under `components/`, `components/patterns/`, and `registry/`.
  Existing registry facet values and `components/ui/*` remain protected.

## Delegation plan

The coordinator owns scope, API fit, integration, and final checks, and runs on the
highest capability tier. There are two delegate packages — implementation and
mechanical review. **First identify which tool is running this brief, then read only
that tool's subsection and skip the other.**

### If you are Claude Code — read this, skip the Codex subsection

Launch each delegate with the Agent tool, setting `subagent_type` to the name below;
the model is already pinned in that file's frontmatter. Pass the filled target
declaration explicitly — do not rely on the delegate having this conversation's
history. Run the coordinator role itself on `opus` (pin `claude-opus-4-8` when
reproducibility is required).

| Package | `subagent_type` | Model |
| --- | --- | --- |
| Implementation | `blockrole-inventory` | `sonnet` (pin `claude-sonnet-5`) |
| Mechanical review | `blockrole-review` | `haiku` (pin `claude-haiku-4-5-20251001`) |

If the Agent tool is unavailable, execute the packages sequentially yourself and
record that fact.

### If you are Codex — read this, skip the Claude Code subsection

Use the reusable definition under `.agents/` and pass its `model`, `reasoning_effort`,
and `agent_type` to the sub-agent runner. Run the coordinator on the session's default
reasoning-high tier.

| Package | `.agents/` definition | Model | Reasoning |
| --- | --- | --- | --- |
| Implementation | `blockrole-inventory.md` | `gpt-5.6-terra` | `medium` |
| Mechanical review | `blockrole-review.md` | `gpt-5.6-luna` | `low` |

### Both tools

Record the actual model used. Keep delegate write sets disjoint and preserve unrelated
changes.

## Requirements

1. Confirm the target exists in both the enum and canonical role profiles and has zero
   compatible standalone inventory before editing.
2. Create one focused component using existing base-ui/shadcn primitives and no new
   dependency unless unavoidable.
3. Create a hand-written Storybook story that renders realistic content and the states
   genuinely supported by the component.
4. Create one experimental block-pattern registry item with accurate files, facets,
   dependencies, evidence, risk, and verification metadata.
5. Do not modify the blockRole enum, ScreenType enum, canonical profiles, existing
   registry facets, golden artifacts, or generated provenance unless validation
   explicitly requires regeneration.
6. Run mechanical review and update `docs/STATUS.md` only after checks pass.

## Acceptance criteria

- [ ] The target existed before this execution and exactly one compatible inventory
      item was added.
- [ ] `git diff -- docs/contracts docs/layers/20-selection` is empty for this task.
- [ ] The new component and story exist and Storybook builds without runtime errors.
- [ ] `npm run validate:facets`, `npm run report:coverage`, `npm run validate`, and
      `npm run checks` exit 0.
- [ ] Review reports zero vocabulary changes, zero maturity promotions, and zero edits
      to existing registry facet values.

## Out of scope

- Adding or changing a blockRole or ScreenType vocabulary value.
- Adding a screen-pattern.
- Creating a second implementation variant for the same role.
- Building an all-role inventory dashboard.
