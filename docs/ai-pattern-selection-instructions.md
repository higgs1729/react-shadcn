# AI Pattern Selection Instructions

Select screen patterns and block patterns for an already-decided flow. Input is a `FlowSpec`, output is a `SelectionSpec`. Resolve as mechanically as possible so the next layer can install dependencies and generate code without further interpretation.

## Input: FlowSpec

The flow is already decided. Each step is one screen and carries only facet signals. `screenType` is not provided; resolve it in step 1.

```jsonc
{
  "flowId": "invoice-management",
  "flowArchetype": "crud",
  "steps": [
    {
      "stepId": "list",
      "order": 1,
      "userIntents": ["browse", "filter"],
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

Facet vocabularies are defined in `docs/ai-design-facets.schema.json`. Canonical screen profiles are documented in `docs/ai-design-system-research.md`. Reject any value outside those enums. If a facet is missing, infer conservatively from the other facets and record the assumption on the output.

## Procedure Per Step

1. **Resolve screenType.** Match `userIntents` + `dataShapes` + `interactionModels` against each `screenType`'s canonical facet profile and pick the best. On a near-tie, put the step in `unresolved` with the tied candidates and escalate; do not guess.
2. **Retrieve and score screen patterns.** Filter `screen-pattern` items by resolved `screenType`, then `userIntents`, then `dataShapes`. Drop items with missing `registryDependencies`, declared incompatibilities, or that cannot cover `requiredStates`. Score 0-100: Intent 25 / DataShape 15 / Interaction 15 / State 15 / A11y 10 / Dependency 10 / Evidence 10. Reject below 70. Take the top; keep rejected alternatives.
3. **Read required block roles** from the chosen pattern's `composition.requiredBlocks`. These are structural; do not derive them from facets. Add `optionalBlocks` only when a step facet clearly calls for one, such as `filter` intent -> `filter-toolbar`.
4. **Select a block pattern per role.** Retrieve `block-pattern` candidates by `blockRole` and score with the same rubric as step 2. Reject below 70. Take the top per role.
5. **Stop at block level.** List each selected item's `registryDependencies` as information only; do not select components.

## Selection Rules

- Prefer higher `maturity`: internal canonical -> official shadcn -> project Storybook items -> mature design-system guidance -> community items only after risk review.
- If a choice rests on one weak source, mark it `experimental` and give a safer canonical fallback in `assumptions`.
- Do not combine multiple navigation shells unless the pattern explicitly supports it.
- Do not add charts unless the data shape includes `metric`, `time-series`, or `categorical`, or a comparison intent is present.
- Do not use dense data blocks for `auth` or `onboarding` screen types.
- Do not recreate shadcn primitives that a registry dependency already provides.
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

- `registryDependencies` is the informational union of selected items' declared dependencies.
- `checksPlanned` records which checks should run later; do not run them here.
- `unresolved` holds any step with no candidate above 70, an unbroken tie, or missing dependencies. Escalate these; do not force a low-confidence pick.

## Self-Review Before Emitting

- Is every step resolved to one `screenType`, or explicitly in `unresolved`?
- Did block roles come from `requiredBlocks`, not raw facets?
- Is every selected item at or above 70?
- Are components left unselected, with dependencies listed only?
- Are rejected alternatives and assumptions recorded?
- Are all `requiredStates` present in `stateCoveragePlan`, or listed as risks?
