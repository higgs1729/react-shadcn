<!-- encoding:UTF-8 -->

# task

別executorへ渡す具体化済みwork orderをtaskIdごとに管理する。taskにする作業・しない作業と、実行から archive までの流れは `apps/studio/AGENTS.md` の Do。

# 索引

- `task-{taskId}.md` — taskIdに対応するタスクの詳細が記述されている
- `template.md` — タスクのテンプレート
- `sequence.json` — 次に割り当てるtaskIdの機械可読な正本
- `model-selection.md` — taskLevelとreasoningLevelを0〜10評価する基準

## このディレクトリだけの約束

- taskを作るのは、会話から切り離しても単独executorが実行できる横断作業、明示的なhandoff、後日実行するwork orderに限る
- 新規taskは `sequence.json.nextTaskId` を使い、同じ変更で値を1増やす。欠番は許容するがIDを再利用しない
- taskは `template.md` に従い、プレースホルダーを残さず自己完結させる
- coordinator役やexecutorからの再委任は行わない。人間承認が必要な場合は承認待ちで停止する
