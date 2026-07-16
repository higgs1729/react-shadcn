# Reusable task playbooks

複数回の成功実績があり、対象を差し替えて繰り返し使う手順を保持する。
新規・進行中の具体的なwork orderは `docs/task/` に置き、`docs/task/template.md` に従う。

playbookは対象値のプレースホルダーと共通手順を持てるが、それ自体を直接実行しない。
実行時は必要な内容を `docs/task/task-{taskId}.md` へ展開し、具体化済みactive task 1枚を
実行者へ渡す。個々の実行完了時にplaybookをarchiveしない。
既存playbookに残るcoordinator/WP分割は旧運用として扱い、新しいactive taskではexecutor
一人が直接実行・自己検証・報告する形へ展開する。下位executorへの再委任は行わない。

## Shared ground rules for every executor

Reusable playbooks may reference this section. When a playbook is expanded into an active
task, copy the applicable rules into that task so the executor receives one self-contained
work order.

- Contracts live in `docs/contracts/` and are enforced by the task-specific validation.
  Run only the checks named by the concrete active task; BuildReport verification tasks
  include `npm run checks`.
- Resolve docs by basename via `scripts/lib/paths.mjs` (`readDoc`); never hardcode
  `docs/` subfolders in scripts.
- Never edit `components/ui/*`, `registry/*.json` facet values, `docs/contracts/*`, or
  anything under `docs/layers/20-selection/`.
- This repo uses base-ui, not Radix: `asChild` and `type="single"` do not exist;
  composition is `render={<.../>}`. When unsure about a component API, read its source
  in `components/ui/`.
- Windows repo: scripts are Node ESM `.mjs`; `spawnSync(..., { shell: true })` for npm/npx.
- Do not read or reference `docs/archive/`.
- Finish by reporting: files created/changed, commands run with exit codes, and any
  requirement you could not satisfy (do not silently narrow scope).
- A task that adds or changes any `registry/*.json` must, as part of its own Definition of
  Done, regenerate the provenance sidecar of every flow that references a changed item and
  leave `npm run validate:provenance` at exit 0. (Provenance digests are selection-scoped, so
  unrelated additions no longer invalidate other flows — but a *referenced* item still must.)
- Never commit or push without the user's explicit approval. Executorは検証結果を報告し、
  人間承認が必要な場合は停止して承認を待つ。

## Execution permission failures (Codex sandbox)

In Codex Desktop, a command can be correct yet fail with `EPERM`, `EACCES`, or
`operation not permitted` because the sandbox blocks a tool-created temporary or output
file. Treat this as an execution-environment failure only when the denied path is one of
the command's expected generated locations, for example:

- Next.js build output such as `.next/trace`.
- Vite / Storybook temporary caches such as `node_modules/.vite-temp/` or
  `node_modules/.cache/storybook/`.
- A requested generated artifact, such as a provenance sidecar under `docs/examples/`.

Use this decision sequence:

1. Preserve the exact command and the denied path in the report. Do not change source code,
   weaken the check, or substitute a different command merely to avoid the write.
2. Rerun that same, narrowly scoped command with an explicit elevated-permission request.
   The request must say what generated directory/file it needs and why; prefer a command
   prefix limited to that check. Do not request broad shell or filesystem permission.
3. If the elevated rerun passes, report the initial failure as a sandbox restriction and the
   elevated result as the authoritative check result.
4. If the denied path is a source file, a protected file, or an unexpected location, stop and
   escalate to the coordinator/user instead of assuming write permission. Likewise, a real
   test, type, lint, build, or a11y failure remains a product failure even when an earlier
   sandbox failure also occurred.
5. If elevated execution is unavailable, report the command, exact error, and blocked output
   path as an unsatisfied requirement. Never claim a skipped browser/build/provenance check
   passed.

Build and browser checks normally write caches even when their user-visible purpose is
verification. After a successful elevated run, continue with the task's ordinary validation
and provenance steps; elevation does not bypass any repository rule.

## Promotion criteria

`docs/task/` の単発taskをそのままここへ移さない。次をすべて満たす手順だけを、対象値を
プレースホルダー化したplaybookとして追加する。

- 同種のtaskで複数回成功し、変動部分と不変手順を説明できる
- 入力宣言、開始ゲート、終了状態、検証コマンドが明確である
- 特定アプリ・一時的な移行・単発の不具合修正に依存しない
- 実行時に `docs/task/template.md` へ展開できる
