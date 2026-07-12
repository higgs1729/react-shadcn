# Repository Sub-Agent Definitions

These files are reusable role definitions for delegated work in this repository.
They are intentionally kept under `.agents/` so a coordinator can pass one file to
one sub-agent together with the target declaration from a task brief.

The Codex app does not automatically discover this directory as a runtime config
surface. The coordinator must read the selected definition and pass its `model` and
`reasoning_effort` to the available sub-agent runner. Claude Code uses its own
custom-subagent directory and frontmatter format.

| Definition | Model | Reasoning | Agent type |
| --- | --- | --- | --- |
| `screentype-coordinator.md` | `gpt-5.6-sol` | `high` | `default` |
| `screentype-taxonomy.md` | `gpt-5.6-terra` | `high` | `explorer` |
| `screentype-fixture.md` | `gpt-5.6-luna` | `medium` | `worker` |
| `screentype-implementation.md` | `gpt-5.6-terra` | `high` | `worker` |
| `screentype-review.md` | `gpt-5.6-luna` | `low` | `explorer` |
| `blockrole-taxonomy.md` | `gpt-5.6-terra` | `high` | `explorer` |
| `blockrole-inventory.md` | `gpt-5.6-terra` | `medium` | `worker` |
| `blockrole-implementation.md` | `gpt-5.6-terra` | `high` | `worker` |
| `blockrole-fixture.md` | `gpt-5.6-luna` | `medium` | `worker` |
| `blockrole-review.md` | `gpt-5.6-luna` | `low` | `explorer` |

`gpt-5.4-mini` remains the preferred cost target for mechanical work when the
calling Codex surface exposes it. The current sub-agent tool exposes Luna but not
Mini, so Luna is the explicit runtime fallback rather than an implicit model change.
