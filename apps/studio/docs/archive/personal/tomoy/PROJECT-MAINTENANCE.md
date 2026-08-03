# Project Maintenance Notes

このメモは tomoy 専用の最小運用メモです。正式なルールはルートの `AGENTS.md` と各 `docs/` 配下の契約文書を優先します。

## よく使う起動

```powershell
npm run dev
```

Next.js の開発サーバーを起動します。通常は表示された localhost URL を開きます。

```powershell
npm run storybook
```

Storybook を `http://localhost:6006` で起動します。ポートが埋まっている場合は、表示される案内に従って別ポートを使います。

```powershell
npm run build-storybook
```

Storybook の静的ビルド確認です。出力先は `storybook-static/` です。

## 変更後の最低限チェック

```powershell
npm run validate
npm run checks
```

`validate` は契約・profile・registry facets・example spec を確認します。`checks` は lint / typecheck / build / Storybook build までまとめて確認します。

サンドボックス内では Google Fonts 取得や Storybook cache 読み取りで失敗することがあります。その場合でも、実環境で再実行して pass するかを確認します。

## ScreenType / blockRole 追加の使い分け

基本は `docs/tasks/task-16-add-one-screen-type.md` から始めます。追加したい
ScreenType が必要とする blockRole を確認し、次の3通りに分岐します。

1. 必要な blockRole が存在し、registry 在庫もある
   - Task 16をそのまま実行してScreenTypeを1つ追加する。
2. blockRole は存在するが、対応するcomponent / story / registry在庫がない
   - `task-18-stock-one-existing-block-role.md` を先に実行する。
   - 在庫追加後、Task 16を最初から再実行する。
3. 必要なblockRole自体が語彙にない
   - Task 16が `docs/block-role-candidates.json` に候補を登録して停止する。
   - 内容を確認してから `task-19-add-one-new-block-role.md` を実行する。
   - blockRole追加完了後、Task 16を最初から再実行する。

各briefは一度に1つだけ追加します。Task 16の途中でblockRoleを追加したり、在庫不足を
避けるために本来必須のroleをoptionalへ落としたりしません。

確認用コマンド:

```powershell
npm run report:coverage
```

これはScreenType / blockRoleごとのregistry在庫数を表示します。現在はblockRole在庫の
有無を確認できますが、component・story・state・checksまで含む品質一覧は将来構想です。

## maturity レビュー

`registry/*.json` の `meta.aiDesignSystem.maturity` を `experimental` から `canonical` に上げる判断は人間レビュー専用です。

レビューでは最低限これを見る:

- `evidence.confidence` と `sourceUrls`
- `risk.level` と `risk.missingStates`
- `accessibility.keyboard`, `focusVisible`, `labels`, `contrastChecked`
- `verification` の各フラグ
- `extensions.localEvidence` の実装が metadata と一致しているか

最初の候補は `registry/page-header-actions-01.json`。missingStates が空で、source が `official-shadcn`、risk が low なので判断しやすいです。

## 注意

- `components/ui/*` 本体、`docs/contracts/*`、`docs/layers/20-selection/*`、既存 registry の facet 値は通常編集しない。
- `docs/archive/` は明示的に必要なとき以外は読まない。
- commit / push は毎回ユーザーの明示承認を得る。
- root instruction を変えたら `CLAUDE.md` は `@AGENTS.md` shim のままにし、`npm run validate:agents` を確認する。
