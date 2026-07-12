# Task 19: Add one new blockRole

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Add exactly one new blockRole vocabulary value, canonical profile, experimental
inventory item, implementation, story, and regression coverage. This task consumes one
accepted need from `docs/block-role-candidates.json` or an equivalent explicit human
declaration.

## Target declaration

```yaml
TARGET_BLOCK_ROLE: <kebab-case new blockRole>
CANDIDATE_ID: <matching candidate id or human-approved>
PRIMARY_JOB: <one sentence describing the block's responsibility>
DISTINGUISH_FROM: <nearest existing roles and decisive distinction>
INITIAL_SCREEN_TYPES: <comma-separated existing ScreenTypes>
REFERENCE_PRODUCTS: <two or more references, comma-separated>
```

## Scoped authorization

The coordinator may append exactly one value to `definitions.blockRole.enum` in
`docs/contracts/ai-design-facets.schema.json` and exactly one matching role profile in
`docs/layers/20-selection/ai-canonical-profiles.json`. It may add the new role to the
listed existing ScreenType profiles symmetrically. No existing claim may be removed or
rewritten. Subagents remain read-only on protected files.

## Context

- Candidate needs are tracked in `docs/block-role-candidates.json` with status
  `proposed`, `accepted`, `implemented`, or `rejected`.
- A new role is justified only when existing roles cannot represent the responsibility
  without materially weakening selection semantics.
- The task is incomplete without standalone registry inventory, a real component, and
  a hand-written Storybook story.
- New entries start `reviewed: false` and `maturity: "experimental"` where supported.

## Delegation plan

- Taxonomy research: `.agents/blockrole-taxonomy.md`.
- Component/registry implementation: `.agents/blockrole-implementation.md`.
- Fixture/test work: `.agents/blockrole-fixture.md`.
- Mechanical review: `.agents/blockrole-review.md`.

The coordinator alone edits protected files and candidate status. Record actual models.

## Requirements

1. Prove that no existing blockRole adequately represents the proposed responsibility;
   include data shapes, interactions, layout region, consuming ScreenTypes, and at
   least two evidence references.
2. Add exactly one blockRole enum value and one matching canonical role profile.
3. Add the role symmetrically to each declared ScreenType profile without changing its
   other claims.
4. Add exactly one experimental block-pattern registry item, component, and Storybook
   story for the new role.
5. Add focused positive and negative regression coverage without hardcoding vocabulary
   counts.
6. After all acceptance checks pass, update the matching candidate to `implemented`
   with `registryItem`, `implementedAt`, and `implementedByTask`. If checks fail, leave
   its prior status unchanged.
7. Update `docs/STATUS.md` only after verification.

## Acceptance criteria

- [ ] Contract diff contains exactly one appended blockRole and no ScreenType change.
- [ ] Profile diff contains exactly one new role profile plus symmetric ScreenType
      references and no maturity promotion.
- [ ] The new block-pattern validates and its story builds and mounts.
- [ ] `npm run validate:schemas`, `npm run validate:profiles`,
      `npm run validate:facets`, `npm run report:coverage`, `npm run validate`, and
      `npm run checks` exit 0.
- [ ] Candidate status changes only after all checks pass.
- [ ] Mechanical review reports one blockRole added, zero ScreenTypes added, and zero
      existing registry facet edits.

## Out of scope

- Adding a ScreenType or a second blockRole.
- Promoting maturity or setting human review approval.
- Implementing a screen-pattern that consumes the role.
- Building an all-role implementation dashboard.
