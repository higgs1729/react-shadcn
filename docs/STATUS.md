'''
encoding:"UTF-8"
'''

# STATUS

プロジェクトの現在地。正本は git log、この文書は最新状態だけを示す要約キャッシュ。

## 現状

- 契約・canonical profile は **13 ScreenTypes / 33 blockRoles**。全 role と type に experimental inventory があり、`npm run report:coverage` は **13/13・33/33、gap 0**。
- 最新の追加は `planning-board` ScreenType と `board-column` blockRole。`board-column-01` は status lane とカード移動を担い、`planning-board-01` は sidebar / header / filter / board column を合成する。
- `inbox-communication`、`document-workspace`、`planning-board` を含む追加 ScreenType はすべて experimental。maturity 昇格と人間レビューは未実施。
- active の `docs/block-role-candidates.json` は空。implemented candidate は `docs/archive/block-role-candidates.json` に保管する。
- golden flow `dryrun-saas-ops-01` は login / overview / invoice-list の3画面で verified・unresolved 0。
- flow `studio-portfolio-01`（Task 20 で選定→実装を実行）は 16 step すべて resolve・unresolved 0、terminal status **verified**（16/16 built）。route は 16 step すべてに `app/flows/studio-portfolio-01/<stepId>/` を生成。
- Task 20 の初回実装では 4 step（`pattern-detail`/`generated-preview`/`contract-explorer` = `detail-01`、`ai-assistant` = `conversation-assistant-01`）が planned a11y check で failed だった。原因は共有 inventory 側の欠陥で、実装後にユーザー依頼で修正済み: `detail-01` の nested `<main>` を `<div>` 化・`<h3>`→`<h2>`（heading-order）、`conversation-assistant-01` の 2 つの `<aside>` に一意な `aria-label`、`ai-conversation-list-01`/`activity-feed-01` の `ItemGroup`(role=list) 直下子要素を `role=listitem` でラップ（aria-required-children）。`components/ui/*`・registry facet・contract・20-selection は不変更。run-planned-checks は 16/16 pass。

## 検証と運用

- 変更後は `npm run validate` と `npm run checks` を exit 0 に保つ。screen state は `npm run test:screen-states`、inventory は `npm run report:coverage` で確認する。
- `validate:pipeline` は registry と SelectionSpec の整合（asset kind / screen type / block role / required blocks / dependency union）を fail-closed で検証する。
- `docs/examples/` の FlowSpec・SelectionSpec・BuildReport は flow ID ごとの三つ組。欠落や命名不一致は fail-loud。
- ScreenType 追加は Task 16 の前提ゲートから始める。既存 role の在庫不足は Task 18、新 role が必要なら candidate を作り Task 19 を先行する。

## 現状のタスク

1. [Studio Portfolio 完成ロードマップ](task-01/studio-portfolio-roadmap.md) の順に、作品の主張・正本コンテンツ・3つの主要ジャーニー・整合性検証・GitHub Pages 配布を実装する。人間は公開時に Repository Settings の Pages source を GitHub Actions に設定する。
2. 次の ScreenType 候補は `spatial-explorer`（map role の必要性を評価）、`calendar-scheduler`（calendar role の必要性を評価）、`operations-console`（dashboard / workflow との重複を精査）。
3. 人間レビューによる maturity 昇格と、blockRole 実装品質の一覧化は未着手。

## 小粒メモ

- `validate:pipeline` と `gen:provenance` の明示引数モードは、指定が欠けると golden flow へフォールバックする。多フロー運用を強める際は、明示モードで三つの成果物指定を必須にする。
- `run-eval.mjs` の編集禁止パスは `AGENTS.md` のルールを複製している。サブエージェントの edited paths を git diff と照合する改善と合わせて、正本を一つに寄せる。
- JSON の BOM 除去処理が複数の検証スクリプトに重複している。該当スクリプトを触る機会に共通ライブラリへ集約する。
- `gen-pattern-stories.mjs` は手書きの role 設定と fixture に依存するため、props 必須の新 block を追加すると生成 story が壊れうる。registry 側に render adapter / fixture 情報を機械可読で持たせる方向を検討する。
- 共有 `file-upload-area-01` のラベルを Button で合成する実装は Base UI の開発時 nativeButton 警告を出す。描画・a11y は阻害しないが、共有 block を変更するため別タスクで扱う。
