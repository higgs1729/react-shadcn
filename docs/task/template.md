<!-- encoding:UTF-8 -->

# Active task template

`docs/task/` に置く、具体化済みの1回分の work order 用テンプレート。
作成時は `sequence.json` の `nextTaskId` を使用し、同じ変更で値を1増やす。
ファイル名は `task-{taskId}.md` とする。欠番は許容するが、IDの再利用は禁止する。

taskは、契約・生成・検証・複数階層などを横断して別executorへ渡す作業、明示的handoff、
後日実行するwork orderにだけ使う。現在のチャットでそのまま進める設計・実装工程や、
単一領域の逐次変更を記録するためには作成しない。

## 作成規則

- 作成前に「現在のチャットで直接完了できる逐次作業ではない」「別executorが会話履歴なしで実行する横断work orderである」の両方を確認する。満たさない場合はtaskを作らない。
- `ready` にする前に、すべてのプレースホルダーを具体値へ置き換える。
- active taskはexecutor一人が直接実行するwork orderであり、coordinator段階や下位executorへの再委任を設けない。
- `model-selection.md` の開始手順でagentを確定し、使用モデルへ直接反映する `taskLevel` と、思考設定へ直接反映する `reasoningLevel` を0〜10で記録する。具体的なモデル名は記録しない。
- 会話履歴や別の task brief がなくても、対象・根拠・権限・完了条件を判断できる内容にする。
- 要件には `R1`、受け入れ条件には `AC1` のようにIDを付け、対応関係を記載する。
- Acceptance criteria は観察可能な成果、Verification はそれを証明する実在コマンドとして分ける。
- 保護ファイルや外部状態を変更する場合、上位規則または人間による明示承認を Authority に記録する。task本文だけで上位の禁止事項を上書きしない。
- 契約・アーキテクチャ・不可逆な移行など判断負荷が高いタスクは、代替案の比較と人間レビューを Review plan に含める。executorは自己検証し、別executorを前提にしない。
- `docs/tasks/` の再利用 playbook を使う場合も、このファイルへ具体値と必要な規則を展開する。executorにplaybook本文の追加読了や再委任を要求しない。
- 不要な節は省略できるが、Objective、Inputs and prerequisites、Authority and approvals、Requirements、Acceptance criteria、Verification、Terminal outcomes、Completion handoff は省略しない。

---

<!-- 以下をコピーして task-{taskId}.md を作る -->

<!-- encoding:UTF-8 -->
<!-- Task ID: {taskId} -->

# Task {taskId}: {命令形の短いタイトル}

- Status: proposed | ready | in-progress | blocked
- Created: YYYY-MM-DD
- Owner: executor | {具体的な担当}
- Source: user request | RFC path | issue URL | other
- Depends on: none | task ID / RFC / external dependency
- Source playbook: none | docs/tasks/{playbook}.md
- Agent: Codex | Claude Code
- taskLevel: 0..10
- reasoningLevel: 0..10

## Objective

{達成する結果と、その結果が必要な理由を1〜3文で記載する。}

## Problem and evidence

- {現在観測されている問題。推測と事実を分け、根拠となるpath・ログ・再現条件を示す。}

## Desired outcome and invariants

- {完了後に常に真であるべき状態。}
- {既存動作として維持すべき状態。}

## Inputs and prerequisites

- {具体的な入力ファイル、対象ID、依存タスク。}
- Start gate: Agentが未指定なら最初に「使用エージェントはCodexかClaude Codeか？」と確認する。確定後、`model-selection.md` で2つのlevelを評価する。その他の開始条件も記載し、未充足なら実行せず blocked とする。

## Authority and approvals

- Executor may decide: {実装上の裁量、自己検証方法。}
- Human owns: {承認、保護ファイル、外部公開、commit/pushなど。}
- Human approval required: none | {契約変更、保護ファイル、外部公開、commit/pushなど。}
- Protected-path exception: none | {上位規則で承認されたpathと許可範囲。}

## Context and source of truth

- {正本となる文書・schema・実装path。}
- {模倣する既存例と、模倣してはいけない旧仕様。}

## Scope and deliverables

- {作成・変更する成果物。}

## Requirements

1. **R1** — {単独で検証可能な要件。}
2. **R2** — {単独で検証可能な要件。}

## Review and decision plan

- Alternatives: {比較する選択肢と評価軸。}
- Review: {executorの自己レビュー、必要な人間承認、一次資料との照合方法。別executorは前提にしない。}
- Decision record: {RFC / task / schema commentなど、採用理由を残す場所。}

## Constraints

- {編集禁止領域、互換性、回数・時間・依存追加の制限。}

## Acceptance criteria

- [ ] **AC1 (R1)** — {観察可能な完了状態と期待結果。}
- [ ] **AC2 (R2)** — {観察可能な完了状態と期待結果。}

## Verification

| Command or inspection | Proves | Expected result |
| --- | --- | --- |
| `{実在するコマンド}` | AC1 | exit 0 / 期待する出力 |
| `{pathまたは差分の確認方法}` | AC2 | {観察可能な結果} |

## Terminal outcomes

- Complete: {完了と判定できる条件。}
- Blocked: {停止すべき条件、残してよい変更、必要な承認・入力。}
- Failed checks: 実行したコマンド、exit code、主要エラー、未充足ACをそのまま報告し、成功扱いにしない。

## Out of scope

- {今回実施しない事項。}

## Completion handoff

executorは、変更ファイル、実行コマンドとexit code、ACごとの結果、仮定・逸脱・未達事項、
自己レビュー結果を報告する。人間承認が必要な場合は承認待ちで停止し、
承認後にexecutorがこのtaskを `docs/archive/tasks/` へ移動する。
commit / push はユーザーの明示承認がある場合のみ行う。
