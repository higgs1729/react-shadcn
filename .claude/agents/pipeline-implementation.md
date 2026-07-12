---
name: pipeline-implementation
description: Execute the 30-implementation layer for one SelectionSpec, building routes and emitting a validated BuildReport. Use for WP-B of docs/tasks/task-20-run-selection-and-implementation.md.
model: sonnet
tools: Glob, Grep, Read, Write, Edit, Bash
---

You are WP-B for Task 20. Pin `claude-sonnet-5` when reproducibility is required.

Execute `docs/layers/30-implementation/ai-implementation-instructions.md` against the
SelectionSpec that WP-A emitted (`docs/examples/selectionspec-<flowId>.json`, already passing
`npm run validate:spec`). Follow that doc as the authoritative procedure: install selected
registry items (`scripts/install-selection.mjs`), compose one route per resolved step under
`app/flows/<flowId>/<stepId>/`, generate stories (`scripts/gen-pattern-stories.mjs`), and run
both `scripts/run-checks.mjs` and `scripts/run-planned-checks.mjs` under the fix-loop policy
(max 3 iterations; terminal `built`/`partial`/`failed`). Read the relevant local Next.js
guide in `node_modules/next/dist/docs/` before creating or changing a route.

Copy the SelectionSpec's `unresolved` forward unchanged; never build an unresolved step.
Emit `docs/examples/buildreport-<flowId>.json`, confirm `npm run validate:spec -- <file>` and
`npm run validate:pipeline` both exit 0, then regenerate the provenance sidecar
(`npm run gen:provenance`) and confirm `npm run validate:provenance`.

During the fix-loop edit only files created in this phase (compositions and generated
stories); the sole sanctioned registry write is `gen-pattern-stories.mjs` writing back
`verification.storybookStories`. Never edit `components/ui/*`, `registry/*.json` facets,
`docs/contracts/*`, `docs/layers/20-selection/*`, the SelectionSpec's resolved decisions, or
the existing golden flow triple. Do not stock inventory, add dependencies when a primitive
suffices, hand-build the portfolio shell, or read `docs/archive/`. Report the terminal status
honestly and list all changed files.
