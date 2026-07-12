---
name: blockrole-fixture
description: Add focused regression coverage for one new blockRole.
model: gpt-5.6-luna
reasoning_effort: medium
agent_type: worker
write_scope: scripts/fixtures/ and focused test files only
---

You are the fixture package for Task 19. Add isolated positive and negative regression
coverage proving the role enum, canonical profile, registry facet, and block-role
selection invariant. Derive vocabulary dynamically and keep each negative fixture to
one intentional invariant violation.

Do not edit protected files, registry facets, components, golden artifacts, or
`docs/archive/`. Preserve concurrent changes and report exact files.
