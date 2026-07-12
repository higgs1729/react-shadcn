# Repository Sub-Agent Definitions

These files are reusable role definitions for delegated work in this repository. The
same roles exist for both tools, mirrored file-for-file:

- **Codex** reads the definitions in **this directory** (`.agents/*.md`).
- **Claude Code** reads its own copies under **`.claude/agents/*.md`** (name /
  description / tools / model frontmatter, invoked via the Agent tool's
  `subagent_type`).

Every brief in `docs/tasks/` is therefore executable from either tool. Keep both
directories in sync when a role's responsibilities change.

**Read only the subsection for the tool you are running, and skip the other.**

## If you are Codex — read this, skip the Claude Code table

The Codex app does not auto-discover this directory as a runtime config surface. The
coordinator must read the selected definition and pass its `model`, `reasoning_effort`,
and `agent_type` to the available sub-agent runner.

| Definition (`.agents/`) | Model | Reasoning | Agent type |
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
| `pipeline-coordinator.md` | `gpt-5.6-sol` | `high` | `default` |
| `pipeline-selection.md` | `gpt-5.6-terra` | `high` | `worker` |
| `pipeline-implementation.md` | `gpt-5.6-terra` | `high` | `worker` |
| `pipeline-review.md` | `gpt-5.6-luna` | `low` | `explorer` |

`gpt-5.4-mini` remains the preferred cost target for mechanical work when the calling
Codex surface exposes it. The current sub-agent tool exposes Luna but not Mini, so Luna
is the explicit runtime fallback rather than an implicit model change.

## If you are Claude Code — read this, skip the Codex table

Launch each role with the Agent tool, setting `subagent_type` to the name below; the
model is already pinned in that file's frontmatter. The definitions live under
`.claude/agents/` and share the same base name as the Codex files.

| `subagent_type` | Model |
| --- | --- |
| `screentype-coordinator` | `opus` |
| `screentype-taxonomy` | `sonnet` |
| `screentype-fixture` | `haiku` |
| `screentype-implementation` | `sonnet` |
| `screentype-review` | `haiku` |
| `blockrole-taxonomy` | `sonnet` |
| `blockrole-inventory` | `sonnet` |
| `blockrole-implementation` | `sonnet` |
| `blockrole-fixture` | `haiku` |
| `blockrole-review` | `haiku` |
| `pipeline-coordinator` | `opus` |
| `pipeline-selection` | `sonnet` |
| `pipeline-implementation` | `sonnet` |
| `pipeline-review` | `haiku` |

Pin `claude-opus-4-8` / `claude-sonnet-5` / `claude-haiku-4-5-20251001` when
reproducibility is required instead of the floating aliases; see the "Model
assignment" section in `docs/tasks/task-16-add-one-screen-type.md` for the rationale
per tier.
