<!-- encoding:UTF-8 -->

# STATUS

現在地の要約キャッシュ(30行上限)。正本は git log。経緯・詳細はコミット履歴と `docs/examples/` を参照。

## 到達状態

- 在庫: **13 ScreenTypes / 33 blockRoles**。全 role・type に experimental inventory あり(`npm run report:coverage` = gap 0)
- golden flow `dryrun-saas-ops-01`(3画面)と flow `studio-portfolio-01`(16 step)はともに verified・unresolved 0
- 旧 `app/flows/studio-portfolio-01/` の16 route は削除済み(在庫実体 `app/*-01/`・registry・story は不変)
- 文書の役割分担を整理済み: README=概要のみ / AGENTS.md=規範と地図 / 本書=現在地

## 進行中・次の作業

1. `studioAppSpec/` を正本に StudioLayout・5 Page・ChildRoute・Drawer/Dialog を静的実装し GitHub Pages へ配布
   (route はトップレベル。`/` は Orientation を表示し完了/skip で `/overview` へ。Pages source の設定は人間が行う)
2. 次の ScreenType 候補: `spatial-explorer` / `calendar-scheduler` / `operations-console`(いずれも新 role 必要性の評価から)
3. maturity 昇格(人間レビュー専用)と blockRole 実装品質の一覧化は未着手

## 既知の課題

- (a11y) `badge` の `destructive` variant が contrast ≈4.0:1 < 4.5。`components/ui/*` 保護のため token 修正は人間承認待ち
- (互換) `command-search-01` story が storybook vitest browser + React 19 で render crash(cmdk 非互換、a11y ではない)
- (小粒) `validate:pipeline` 引数フォールバックの必須化余地 / `run-eval.mjs` の編集禁止パスが AGENTS.md と重複 /
  BOM 除去処理の重複 / `gen-pattern-stories.mjs` の手書き fixture 依存 / `file-upload-area-01` の nativeButton 警告
