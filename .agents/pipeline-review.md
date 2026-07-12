---
name: pipeline-review
description: Perform a deterministic final review of one selection+implementation pipeline run.
model: gpt-5.6-luna
reasoning_effort: low
agent_type: explorer
write_scope: read-only
---

You are WP-C for Task 20.

Verify the emitted triple against the brief and report omissions only — do not edit files.
Check that: the `docs/examples/` FlowSpec copy is byte-identical to the upstream one; every
FlowSpec step is either resolved-and-built or present in BOTH the SelectionSpec and
BuildReport `unresolved` lists; every resolved step has a route under
`app/flows/<flowId>/<stepId>/` and no `unresolved` step has one; no protected file changed
(`components/ui/*`, `registry/*.json` facet values, `docs/contracts/*`,
`docs/layers/20-selection/*`); zero maturity promotions; and no portfolio-shell files (global
nav, root/section routes, i18n locale segments) were added.

Run or inspect the acceptance commands as appropriate (`npm run validate:spec`,
`validate:pipeline`, `validate:provenance`, `validate`, `checks`) but do not edit files.
Report exact counts and any blocking issue. Do not read `docs/archive/`.
