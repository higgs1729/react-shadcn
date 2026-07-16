<!-- encoding:UTF-8 -->

# task

契約・生成・検証・複数階層などを横断し、別executorへ渡す具体化済みwork orderをtaskIdごとに管理する。現在のチャットで連続して進める設計・実装の工程管理には使わない。

# 索引

- `task-{taskId}.md` — taskIdに対応するタスクの詳細が記述されている
- `template.md` — タスクのテンプレート
- `sequence.json` — 次に割り当てるtaskIdの機械可読な正本
- `model-selection.md` — taskLevelとreasoningLevelを0〜10評価する基準

## このディレクトリだけの約束

- taskを作るのは、会話から切り離しても単独executorが実行できる横断作業、明示的なhandoff、後日実行するwork orderに限る
- 現在のチャット内でそのまま進めるbrief→JTBD→flow→設計→実装の各段階や、単一領域の小変更にはtaskを作らない
- 新規taskは `sequence.json.nextTaskId` を使い、同じ変更で値を1増やす。欠番は許容するがIDを再利用しない
- taskは `template.md` に従い、プレースホルダーを残さず自己完結させる
- taskはexecutor一人が直接実行・自己検証・報告まで完結する。coordinator役やexecutorからの再委任は行わない。人間承認が必要な場合は承認待ちで停止する
- 検証と承認が完了したtaskは、executorが同じ回で `archive/tasks/` へ移動する
