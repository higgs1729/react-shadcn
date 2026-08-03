<!-- encoding:UTF-8 -->

# STATUS

- 現在地の要約キャッシュ。正本は git log。経緯・詳細はコミット履歴と `docs/examples/` を参照。
- 下記の「到達状況」は最新の５個、「進行中の作業」は最新のものを最大３つ書く。
- gitlogと差異があった場合、内容に合わせて下のどれかを編集する

## 到達状態

- モノレポ化 Phase 1-2 完了(2026-08-03)。本 app は `apps/studio` になり、Team T は `apps/team-t` へ分離。
  リポジトリ全体の地図はルートの `AGENTS.md` を見る。本書は studio の現在地のみを扱う
- 在庫: **13 ScreenTypes / 33 blockRoles**。全 role・type に experimental inventory あり(`npm run report:coverage` = gap 0)
- golden flow `dryrun-saas-ops-01`(3画面)と flow `studio-portfolio-01`(16 step)はともに verified・unresolved 0
- 旧 `app/flows/studio-portfolio-01/` の16 route は削除済み(在庫実体 `app/(system)/*-01/`・registry・story は不変)
- システム/作品の分断済み(2026-07-16): 在庫実体は `app/(system)/`+`components/blocks/`、作品は `app/(studio)/`+`components/studio-portfolio/`+`lib/studio-portfolio/`+`docs/apps/studio/`。URL は route group のため不変

## 着手予定の作業
- モノレポ化 Phase 3(`apps/portal` と `apps/python-test` の分離。studio の URL が `/studio/` 配下へ移る)
- モノレポ化 Phase 4-5(`packages/shadcn-kit` 抽出・GoldenFlow の CI ゲート解除)
- maturity 昇格(人間レビュー専用)と blockRole 実装品質の一覧化

## 既知の課題

- (a11y) `badge` の `destructive` variant が contrast ≈4.0:1 < 4.5。`components/ui/*` 保護のため token 修正は人間承認待ち
- (互換) `command-search-01` story が storybook vitest browser + React 19 で render crash(cmdk 非互換、a11y ではない)
- (CI) 両 workflow の `actions/checkout@v4`・`actions/setup-node@v4` が Node 20 を指しており、runner 側で
  Node 24 へ強制実行されている(GitHub の Node 20 廃止告知による警告)。現状は警告のみで失敗しないが、
  廃止完了までに `@v5` 系へ更新する
- (小粒) `validate:pipeline` 引数フォールバックの必須化余地 / `run-eval.mjs` の編集禁止パスが AGENTS.md と重複 /
  BOM 除去処理の重複 / `gen-pattern-stories.mjs` の手書き fixture 依存 / `file-upload-area-01` の nativeButton 警告
