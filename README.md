# AI Design System

This repository turns an app brief into a checked implementation plan for shadcn/ui patterns.
The handoff between agents is intentionally mechanical: FlowSpec, SelectionSpec, and BuildReport
artifacts are JSON files validated with JSON Schema and ajv.

## Pipeline

1. Brief: describe the user, job, screens, and constraints.
2. JTBD and flow: clarify the work the app must help users complete.
3. FlowSpec: record the screens, routes, and user-facing flow.
4. SelectionSpec: choose screen types and blocks from the pattern inventory.
5. Implementation: build the selected UI with the local Next.js and base-ui conventions.
6. BuildReport: report what was built, what checks ran, and unresolved issues.

## Repository Map

- [docs/STATUS.md](docs/STATUS.md): current project state and next candidate work.
- [docs/contracts/](docs/contracts/): JSON Schemas for FlowSpec, SelectionSpec, BuildReport, facets, and profiles.
- [docs/layers/10-upstream/](docs/layers/10-upstream/): upstream brief and flow notes.
- [docs/layers/20-selection/](docs/layers/20-selection/): screen and block selection guidance plus canonical profiles.
- [docs/layers/30-implementation/](docs/layers/30-implementation/): implementation rules for executors.
- [docs/tasks/](docs/tasks/): pending or in-flight executor briefs.
- [docs/rfcs/](docs/rfcs/): rationale for reliability and process improvements.
- [docs/examples/](docs/examples/): current golden-flow artifacts.
- [registry/](registry/): pattern inventory; AI metadata lives under `meta.aiDesignSystem`.
- [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md): root agent instructions.

## Quick Start

```bash
npm install
npm run validate
npm run checks
```

Use `npm run dev` for local development and `npm run build` before release-oriented review.
This repo uses Next.js 16 and base-ui through shadcn/ui; read the local component source when an
API is unclear.

## Current Golden Flow

The current golden flow is `dryrun-saas-ops-01`.

- FlowSpec: [docs/examples/flowspec-dryrun-01.json](docs/examples/flowspec-dryrun-01.json)
- SelectionSpec: [docs/examples/selectionspec-dryrun-02.json](docs/examples/selectionspec-dryrun-02.json)
- BuildReport: [docs/examples/buildreport-dryrun-saas-ops-02.json](docs/examples/buildreport-dryrun-saas-ops-02.json)

It covers three built screens: login, overview, and invoice-list. The latest BuildReport is verified
with zero unresolved issues.

## Validation

- `npm run validate`: validates profiles, facets, specs, and root agent instruction sync.
- `npm run validate:agents`: verifies that `AGENTS.md` remains the canonical instruction source and
  `CLAUDE.md` remains the deterministic `@AGENTS.md` shim.
- `npm run checks`: runs the verification suite used by BuildReport checks.

The agent-sync check runs offline and accepts optional paths for review work:

```bash
npm run validate:agents -- CLAUDE.md
```

## Human Approval Boundaries

- Commit and push only after explicit human approval.
- Do not promote pattern maturity from `experimental` to `canonical` without human review.
- Do not edit contract schemas, canonical selection guidance, registry facet values, or archived
  documents as part of routine executor work.
- Do not add path-specific instruction files until a directory has repeated, concrete rules that
  would reduce root-level noise. Until then, keep root instructions concise and link to the detailed
  docs above.
