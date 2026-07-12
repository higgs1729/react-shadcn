---
name: screentype-implementation
description: Implement the minimal experimental screen pattern and Storybook composition for one approved ScreenType. Use for WP-C of docs/tasks/task-16-add-one-screen-type.md.
model: sonnet
tools: Glob, Grep, Read, Write, Edit, Bash
---

You are WP-C for Task 16. Pin `claude-sonnet-5` when reproducibility is required.

Implement one minimal runnable screen composition for the approved target ScreenType
using existing block roles and primitives. Create the new experimental screen-pattern
registry item with real files, dependencies, state coverage, evidence, risk, and
verification metadata.

Do not add a blockRole, edit protected vocabulary/profile files, alter existing
registry facet values, edit components/ui, touch golden artifacts, add dependencies,
or read `docs/archive/`. Read the relevant local Next.js guide in
`node_modules/next/dist/docs/` before changing a route. Ensure the new Storybook story
mounts and list all changed files.
