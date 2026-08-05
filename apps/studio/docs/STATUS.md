<!-- encoding:UTF-8 -->

# STATUS

- 現在地の要約キャッシュ。正本は git log。経緯・詳細はコミット履歴と `docs/examples/` を参照。
- 下記の「到達状況」は最新の５個、「進行中の作業」は最新のものを最大３つ書く。
- gitlogと差異があった場合、内容に合わせて下のどれかを編集する

## 到達状態

- モノレポ化 Phase 1-4 完了(2026-08-06)。本 app は `apps/studio`、Team T は `apps/team-t`、
  さらに `apps/portal` と `apps/python-test` を分離し(33acb6e)、共有 UI を `packages/shadcn-kit` へ
  抽出済み(6f5ec7d)。リポジトリ全体の地図はルートの `AGENTS.md` を見る。本書は studio の現在地のみを扱う
- `npm run checks` に tests ゲートを追加(2026-08-06)。24 本の `test:*` を `test:all` が一括実行する。
  それまで test は CI からも手元からも一度も走っておらず、2 本が壊れたまま残っていた
- 在庫: **13 ScreenTypes / 33 blockRoles**。全 role・type に experimental inventory あり(`npm run report:coverage` = gap 0)
- golden flow `dryrun-saas-ops-01`(3画面)と flow `studio-portfolio-01`(16 step)はともに verified・unresolved 0
- システム/作品の分断済み(2026-07-16): 在庫実体は `app/(system)/`+`components/blocks/`、作品は `app/(studio)/`+`components/studio-portfolio/`+`lib/studio-portfolio/`+`docs/apps/studio/`。URL は route group のため不変

## 着手予定の作業
- モノレポ化 Phase 5(GoldenFlow の CI ゲート解除)
- maturity 昇格(人間レビュー専用)と blockRole 実装品質の一覧化

## 既知の課題

- (a11y) `badge` の `destructive` variant が contrast ≈4.0:1 < 4.5。`components/ui/*` 保護のため token 修正は人間承認待ち
- (互換) `command-search-01` story が storybook vitest browser + React 19 で render crash(cmdk 非互換、a11y ではない)
- (CI) 両 workflow の `actions/checkout@v4`・`actions/setup-node@v4` が Node 20 を指しており、runner 側で
  Node 24 へ強制実行されている(GitHub の Node 20 廃止告知による警告)。現状は警告のみで失敗しないが、
  廃止完了までに `@v5` 系へ更新する
- (小粒) `validate:pipeline` 引数フォールバックの必須化余地 / `run-eval.mjs` の編集禁止パスが AGENTS.md と重複 /
  BOM 除去処理の重複 / `gen-pattern-stories.mjs` の手書き fixture 依存 / `file-upload-area-01` の nativeButton 警告
