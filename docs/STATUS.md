<!-- encoding:UTF-8 -->

# STATUS

- 現在地の要約キャッシュ。正本は git log。経緯・詳細はコミット履歴と `docs/examples/` を参照。
- 下記の「到達状況」は最新の５個、「進行中の作業」は最新のものを最大３つ書く。
- gitlogと差異があった場合、内容に合わせて下のどれかを編集する

## 到達状態

- 在庫: **13 ScreenTypes / 33 blockRoles**。全 role・type に experimental inventory あり(`npm run report:coverage` = gap 0)
- golden flow `dryrun-saas-ops-01`(3画面)と flow `studio-portfolio-01`(16 step)はともに verified・unresolved 0
- 旧 `app/flows/studio-portfolio-01/` の16 route は削除済み(在庫実体 `app/(system)/*-01/`・registry・story は不変)
- システム/作品の分断済み(2026-07-16): 在庫実体は `app/(system)/`+`components/blocks/`、作品は `app/(studio)/`+`components/studio-portfolio/`+`lib/studio-portfolio/`+`docs/apps/studio/`。URL は route group のため不変。registry パス変更に伴い provenance sidecar は両フロー再生成済み
- 文書の役割分担を整理済み: README=概要のみ / AGENTS.md=規範と地図 / 本書=現在地

## 着手予定の作業
- maturity 昇格(人間レビュー専用)と blockRole 実装品質の一覧化
- 次の ScreenType 候補: `spatial-explorer` / `calendar-scheduler` / `operations-console`(いずれも新 role 必要性の評価から)

## 既知の課題

- (a11y) `badge` の `destructive` variant が contrast ≈4.0:1 < 4.5。`components/ui/*` 保護のため token 修正は人間承認待ち
- (互換) `command-search-01` story が storybook vitest browser + React 19 で render crash(cmdk 非互換、a11y ではない)
- (小粒) `validate:pipeline` 引数フォールバックの必須化余地 / `run-eval.mjs` の編集禁止パスが AGENTS.md と重複 /
  BOM 除去処理の重複 / `gen-pattern-stories.mjs` の手書き fixture 依存 / `file-upload-area-01` の nativeButton 警告
