# AI Pattern Selection Instructions

Select screen patterns and block patterns for an already-decided flow. Input is a `FlowSpec`; output is a `SelectionSpec`. Resolve as mechanically as possible so the next implementation layer can install dependencies and generate code without further interpretation.

## Input: FlowSpec

The flow is already decided. Each step represents one screen and carries only facet signals. `screenType` is not provided; resolve it in step 1.

```jsonc
{
  "flowId": "invoice-management",
  "flowArchetype": "crud",
  "steps": [
    {
      "stepId": "list",
      "order": 1,
      "userIntents": ["browse", "filter"],
      "jobMapStages": ["locate"],
      "dataShapes": ["collection"],
      "interactionModels": ["filter-sort", "selection-multiple"],
      "density": "high",
      "requiredStates": ["default", "loading", "empty", "error"],
      "accessibilityConstraints": { "keyboard": true, "apgPattern": "grid" },
      "visualTone": ["enterprise"],
      "transitions": { "onSelect": "detail" }
    }
  ]
}
```

Facet vocabularies are defined in `docs/contracts/ai-design-facets.schema.json`. Canonical screen profiles live in `docs/layers/20-selection/ai-canonical-profiles.json` (validated by `npm run validate:profiles`). Reject any value outside those enums. If a facet is missing, infer conservatively from the other facets and record the assumption in the output.

## Procedure Per Step

1. **Resolve screenType.** Score every canonical profile in `docs/layers/20-selection/ai-canonical-profiles.json` against the step and pick the highest:

   ```
   score(step, S) = 40*C_intent + 20*C_shape + 15*C_interaction + 25*C_stage

   C_x = |step.x ∩ S.x| / |step.x|   (coverage of the step's facets by the profile;
                                       if the step omits an axis, redistribute its
                                       points proportionally across the other axes)
   ```

   `jobMapStages` on the step comes mechanically from the upstream Job Map decomposition;
   never infer it here. If the top two scores differ by less than 8 (near-tie), break the
   tie in this order: (1) exact `jobMapStages` set match, (2) `density` match, (3) put the
   step in `unresolved` with the tied candidates and escalate; do not guess.
2. **Retrieve and score screen patterns.** Filter `screen-pattern` items by resolved `screenType`, then `userIntents`, then `dataShapes`. Drop items with missing `registryDependencies`, declared incompatibilities, or insufficient `requiredStates` coverage. Score 0-100: Intent 25 / DataShape 15 / Interaction 15 / State 15 / A11y 10 / Dependency 10 / Evidence 10. Reject below 70. Take the top candidate and keep rejected alternatives.
3. **Read required block roles.** Read roles from the chosen screen pattern's `composition.requiredBlocks`. These are structural; do not derive them directly from raw facets. Add `optionalBlocks` only when a step facet clearly calls for one, such as `filter` intent -> `filter-toolbar`.
4. **Select a block pattern per role.**
   - Retrieve `block-pattern` candidates by `blockRole`.
   - **Role-fit scoring.** Do not score block candidates against the step's content facets —
     a block's vocation is defined by its role, not by the page's overall intent (a header
     block never shares a monitoring step's intents). Score each candidate against the
     role's canonical profile using consistency coverage `K_x = |item.x ∩ roleProfile.x| /
     |item.x|` (an item narrower than its role is fine; off-role claims are penalized):
     intents `25*K_intent` + dataShapes `15*K_shape` + interactions `15*K_interaction`,
     plus step-driven components: required-state coverage (15), accessibility (10),
     dependency fit (10), evidence (10). Reject below 70. Take the top candidate per role.
   - **Shell hard filter.** For `app-shell-*` roles, additionally require `layoutModel.shell`
     compatibility with the chosen screen pattern, honor `incompatibleWith`, and select at
     most one shell per screen.
   - **Inventory-first policy.** Screen patterns are composition skeletons, not bundles:
     every required role resolves to a standalone `block-pattern` item (this invariant is
     enforced by `npm run validate:facets`). An imported monolithic block must be decomposed
     into block items before promotion beyond `experimental`.
5. **Stop at block level.** List each selected item's `registryDependencies` as information only. Do not select individual components.

## Selection Rules

- Prefer higher `maturity`: internal canonical -> official shadcn -> project Storybook items -> mature design-system guidance -> community items after risk review.
- If a choice rests on one weak source, mark it `experimental` and provide a safer canonical fallback in `assumptions`.
- Do not combine multiple navigation shells unless the pattern explicitly supports it.
- Do not add charts unless `dataShapes` includes `metric`, `time-series`, or `categorical`, or a comparison intent is present.
- Do not use dense data blocks for `auth` or `onboarding` screen types.
- Do not recreate shadcn primitives already provided by a registry dependency.
- Require `empty`, `loading`, `error`, and `permission-denied` coverage for data-driven screens.
- Include an AI explainability block when AI output materially affects user decisions.
- Treat `visualTone` as a tiebreaker only.

## Output: SelectionSpec

```jsonc
{
  "flowId": "invoice-management",
  "screens": [
    {
      "stepId": "list",
      "resolvedScreenType": "collection",
      "screenPattern": {
        "registryItem": "collection-table-01",
        "score": 88,
        "rejected": [
          {
            "registryItem": "collection-grid-01",
            "score": 74,
            "reason": "lower density fit"
          }
        ]
      },
      "blocks": [
        {
          "blockRole": "filter-toolbar",
          "registryItem": "filter-toolbar-02",
          "score": 91
        },
        {
          "blockRole": "data-table-panel",
          "registryItem": "data-table-panel-01",
          "score": 85
        }
      ],
      "registryDependencies": ["sidebar", "table", "checkbox", "button", "input", "select"],
      "stateCoveragePlan": ["default", "loading", "empty", "error"],
      "checksPlanned": ["lint", "typecheck", "a11y", "story"],
      "assumptions": [],
      "risks": []
    }
  ],
  "unresolved": []
}
```

- `registryDependencies` is the informational union of dependencies declared by selected items.
- `checksPlanned` records checks that should run later. Do not run them in this layer.
- `unresolved` holds steps with no candidate above 70, an unbroken tie, or missing dependencies. Escalate these; do not force a low-confidence pick.

## Self-Review Before Emitting

Before emitting, verify all of the following:

- Every step is resolved to one `screenType`, or explicitly listed in `unresolved`.
- Block roles came from `requiredBlocks`, not raw facets.
- Every selected item is at or above 70.
- Components are not selected; dependencies are listed only as information.
- Rejected alternatives and assumptions are recorded.
- Every `requiredStates` value is present in `stateCoveragePlan`, or listed as a risk.

## Self-Review Failure Loop

If any self-review item fails, do not emit that `SelectionSpec`. Run this loop:

1. List the failed checks internally as `reviewFailures`.
2. Fix correctable failures by retrieving candidates again, recalculating scores, rereading block roles, or adding missing `assumptions`, `risks`, and rejected alternatives.
3. After fixing, rerun Self-Review Before Emitting from the beginning.
4. Repeat improvement and review until every check succeeds.
5. If a failure cannot be fixed inside this selection layer, such as missing candidates, an unbroken tie, or missing dependencies, move the affected step to `unresolved`, record the reason, and rerun self-review.
6. Emit only a `SelectionSpec` that has passed self-review.

This loop does not run implementation-layer checks. It only improves selection-layer output consistency until self-review succeeds.
