# AI Pattern Selection Instructions

Select screen patterns and block patterns for an already-decided flow. Input is a `FlowSpec`; output is a `SelectionSpec`. Resolve as mechanically as possible so the next implementation layer can install dependencies and generate code without further interpretation.

## Input: FlowSpec

The flow is already decided (schema: `docs/contracts/`; worked example: `docs/examples/flowspec-*.json`). Each step represents one screen and carries only facet signals — `stepId`, `userIntents`, `jobMapStages`, `dataShapes`, `interactionModels`, `density`, `requiredStates`, `accessibilityConstraints`, `visualTone`, `transitions`. `screenType` is not provided; resolve it in step 1.

Facet vocabularies are defined in `ai-design-facets.schema.json` and canonical screen profiles in `ai-canonical-profiles.json` (both located by filename under `docs/`). Reject any value outside those enums. If a facet is missing, infer conservatively from the other facets and record the assumption in the output.

## State-inventory model

`meta.aiDesignSystem.stateCoverage` is the inventory declaration for an implemented
screen-pattern. It classifies what that individual pattern can render; it never creates a
baseline requirement for every pattern of the same `screenType`.

```text
ScreenType inventory
├─ user states: default, loading, empty, error, permission-denied
├─ interaction states: validation-error, disabled, success
└─ environment variants: mobile, dark-mode, rtl
```

For a FlowSpec step, its `requiredStates` is the sole state gate. A candidate is eligible
only when its `stateCoverage` contains every requested value. Do not infer additional state
requirements from `screenType`, `dataShapes`, `interactionModels`, or a generic
"data-driven" policy. A missing state is a truthful inventory gap: reject that candidate
and leave the step unresolved when no eligible candidate remains.

## Procedure Per Step

1. **Resolve screenType.** Score every canonical profile in `ai-canonical-profiles.json` against the step and pick the highest:

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
2. **Retrieve and score screen patterns.** Filter `screen-pattern` items by resolved `screenType`, then `userIntents`, then `dataShapes`. Drop items with missing `registryDependencies`, declared incompatibilities, or any `FlowSpec.requiredStates` value absent from `stateCoverage`. Score 0-100: Intent 25 / DataShape 15 / Interaction 15 / State 15 / A11y 10 / Dependency 10 / Evidence 10. Reject below 70. Take the top candidate and keep rejected alternatives.
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
- `checksPlanned` records check IDs that should run later (registry: `scripts/lib/check-registry.mjs`). Do not run them in this layer.
- `unresolved` holds steps with no candidate above 70, an unbroken tie, or missing dependencies. Escalate these; do not force a low-confidence pick.

Write the result to `docs/examples/selectionspec-<flowId>.json` and validate it with
`npm run validate:spec -- <file>` (must exit 0 before handoff). Cross-artifact validation
(`npm run validate:pipeline`) runs only after the implementation layer emits a BuildReport,
not here.

## Self-Review Before Emitting

Before emitting, verify all of the following:

- Every step is resolved to one `screenType`, or explicitly listed in `unresolved`.
- Block roles came from `requiredBlocks`, not raw facets.
- Every selected item is at or above 70.
- Components are not selected; dependencies are listed only as information.
- Rejected alternatives and assumptions are recorded.
- Every `requiredStates` value is present in both `stateCoveragePlan` and the selected
  screen pattern's declared `stateCoverage`; otherwise the step is `unresolved`.

If any self-review item fails, do not emit: fix correctable failures (re-retrieve candidates,
recalculate scores, reread block roles, add missing `assumptions`/`risks`/rejected alternatives)
and rerun the full self-review. Failures unfixable in this layer (missing candidates, unbroken
tie, missing dependencies) move the step to `unresolved` with the reason. Emit only after every
check passes. This loop never runs implementation-layer checks.
