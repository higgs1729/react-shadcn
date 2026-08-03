<!-- encoding:UTF-8 -->

# apps/python-test

Python3 エンジニア認定データ分析試験の模擬問題集。181 問を分野・難易度で絞って解き、
誤答とマークから復習を組み立てる。静的 export で `/react-shadcn/python-test/` に公開する。

## 索引

- `app/` — `page.tsx` が入口、`layout.tsx` が root layout、`globals.css` にトークン
- `components/python-test/` — アプリ固有 UI。primitive は `@react-shadcn/shadcn-kit/ui/*` から取る
- `lib/python-test/` — 問題データ・出題ロジック・進捗の永続化
- `e2e/` — Playwright スモーク(`npm run test:smoke`)
- `docs/` — アプリの概要

## このディレクトリだけの約束

- 学習データはサーバーを持たず `localStorage` に保存する。キーを変えるときは旧キーからの移行を同時に実装する
- アプリ固有の色は `globals.css` の `.python-test-app` スコープに閉じ、共有トークンを書き換えない
- primitive を自前で複製しない。不足があれば `packages/shadcn-kit` 側に `shadcn add` する
- 問題データの変更は `lib/python-test/` 側だけで完結させ、UI に問題文を直書きしない
