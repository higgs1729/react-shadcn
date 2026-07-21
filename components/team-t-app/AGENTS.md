<!-- encoding:UTF-8 -->

# Team T app components

Team T アプリ専用の UI 実体を置く。

## 索引

- `team-t-app-shell.tsx`・`team-t-sidebar.tsx`・`team-t-header.tsx` — Team T の状態所有と探索 shell
- `team-t-settings-dialog.tsx`・`use-team-t-appearance.ts`・`category-icon.tsx` — 端末内設定、外観の `<html>` 適用、カタログの意味アイコン
- `catalog-search.tsx`・`catalog-tree.tsx` — カタログの検索・階層選択
- `team-t-welcome.tsx`・`api-summary.tsx`・`api-preview.tsx` — welcome、選択概要、iframe workspace
- `*.stories.tsx` — Team T 固有 UI の主要状態を再現する Storybook story

## このディレクトリだけの約束

- `components/ui/*` は編集せず、公開 API を利用する
- registry 在庫を変更せず、Team T 固有の composition と content binding をこの階層で行う
- component は必要な状態を props で再現できるようにし、状態ごとの story と検証を同じ vertical slice で追加する
- route、データ取得、永続化を UI component へ直接埋め込まない
