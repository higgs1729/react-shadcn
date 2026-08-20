# Selection eval golden dataset

A small, versioned set of cases that grades the **behavior** of the selection
workflow (`docs/layers/20-selection/ai-pattern-selection-instructions.md`), not
merely whether output JSON parses. It catches regressions such as: a clear
winner no longer winning, a below-threshold or tied step failing to escalate to
`unresolved`, a required state silently dropped, or a candidate straying outside
its allowed edit surface.

The selection instructions are **immutable**; this dataset tests them, it never
changes them. Grading is fully deterministic and offline — no LLM, network, or
hosted eval service is involved (an LLM is never the grader).

## Layout

- `cases/` — the positive dataset. One case per `*.json` file. `npm run eval`
  grades all of them and exits 0.
- `fixtures/` — intentionally failing case(s), kept out of the positive dataset.
  Used by `npm run eval:fixture` and `npm run test:eval`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run eval` | Grade every case in `eval/cases`. Exit 0 iff all pass. |
| `npm run eval:candidate -- --candidates <dir>` | Stage external candidate JSON files in a temporary directory and grade them against the frozen cases. The wrapper does not start an agent. |
| `npm run eval:fixture` | Grade the failing fixture; exits non-zero and names the failing case ID. |
| `npm run test:eval` | Assert the positive dataset passes and the failing fixture is detected. |

The underlying runner also accepts an explicit path and an optional candidate source:

```
node scripts/run-eval.mjs [<dataset-dir-or-file>] [--candidates <dir>]
```

`--candidates <dir>` loads each case's candidate output from `<dir>/<caseId>.json`
instead of the embedded one. `eval:candidate` is the recommended local wrapper:
it copies only top-level regular JSON files into a temporary staging directory,
then invokes this runner without changing the source candidates or frozen cases.
An external **agent runner** remains responsible for producing those JSON files;
the wrapper never calls an agent or an LLM.

## Case format

Each case is a self-contained JSON object:

```jsonc
{
  "id": "clear-winner-collection",        // stable, unique case ID (used in reports)
  "class": "clear-winner",                // boundary class label
  "metadata": {
    "description": "...",
    "inputProvenance": "..."              // where the input came from
  },
  "input": {                              // frozen step signals (small, human-reviewable)
    "stepId": "orders",
    "userIntents": ["browse", "filter"],
    "dataShapes": ["collection"],
    "requiredStates": ["default", "loading", "empty", "error"]
  },
  "candidate": {                          // the output under evaluation
    "status": "resolved",                 // "resolved" | "unresolved"
    "screenPattern": { "registryItem": "collection-table-01", "score": 95, "rejected": [ ... ] },
    "stateCoveragePlan": ["default", "loading", "empty", "error"],
    "checksPlanned": ["lint", "typecheck", "a11y", "story"],
    "editedPaths": [],                    // files the run reports editing
    "risks": [],
    "unresolved": {                       // only when status === "unresolved"
      "category": "below-threshold" | "near-tie" | "missing-dependency",
      "reason": "...",
      "tiedCandidates": [...],            // for near-tie
      "droppedCandidates": [...]          // for missing-dependency / drops
    }
  },
  "expect": { ... }                       // assertions the grader checks (below)
}
```

### Graded facts (`expect`)

Only the keys present are asserted, so a case states just what it cares about.

| `expect` key | Deterministic check |
| --- | --- |
| `status` | `candidate.status` equals it. |
| `selected` | `candidate.screenPattern.registryItem` equals it. |
| `rejected` (array) | Each ID appears among the candidate's rejected / dropped candidates. |
| `unresolvedReason.category` | `candidate.unresolved.category` equals it. |
| `unresolvedReason.textIncludes` | `candidate.unresolved.reason` contains the substring. |
| `tiedCandidates` (array) | Equals `candidate.unresolved.tiedCandidates` as a set. |
| `checkPlanKnown: true` | Every `checksPlanned` ID is in Task 07's `KNOWN_CHECK_IDS`. |
| `stateCoverageSatisfied` (bool) | Every `input.requiredStates` value is in `stateCoveragePlan` **or** named in a `risks` string. |
| `prohibitedEdits` (array) | The forbidden-path edits the grader finds in `editedPaths` equal this set. **Defaults to `[]`** — every case guards against forbidden edits even without declaring the key. |

Forbidden edit prefixes (from `AGENTS.md` `編集禁止`): `components/ui/`,
`docs/contracts/`, `docs/layers/20-selection/`, `registry/`.

## Boundary classes covered

`baseline` (golden), `clear-winner`, `below-threshold`, `near-tie`,
`missing-dependency`, `inadequate-required-state-coverage`,
`forbidden-edit-attempt`.

## Adding a case without touching existing results

1. Create a **new** file `eval/cases/<new-id>.json`. Do not edit any existing
   case — expected results are frozen so regressions stay meaningful.
2. Keep the input small and human-reviewable; do not paste whole repo files.
3. Give it a unique `id` and set `class`.
4. Run `npm run eval` — it auto-discovers every `*.json` in `eval/cases`.

The `baseline-golden-*` case is immutable: it pins the current golden flow's
selection. If a legitimate inventory change alters the golden output, update the
golden artifacts in `docs/examples/` and this baseline together, in that change.
