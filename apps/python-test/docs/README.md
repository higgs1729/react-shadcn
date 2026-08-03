# Python test app

Python3 エンジニア認定データ分析試験向けの、181問を収録した個人学習アプリ。
`python-test` リポジトリの React/Vite UI を `react-shadcn` の独立アプリとして移植する。

## 配置

- route: `app/(python-test)/python-test/`
- UI: `components/python-test/`
- 問題・型・純粋ロジック: `lib/python-test/`
- URL: `/python-test/`

## pywebview 差分の吸収

旧版で pywebview が提供していた責務は、Web 版では次のように置き換える。

| 旧版                             | 統合版                               |
| -------------------------------- | ------------------------------------ |
| ネイティブウィンドウ             | ブラウザの `/python-test/` route     |
| `window.pywebview.api.load/save` | versioned `localStorage`             |
| `progress.json`                  | 画面上の JSON 読み込み・書き出し     |
| `close()` / `/api/shutdown`      | ポータルの Apps へ戻るリンク         |
| Python 内蔵 HTTP server          | Next.js の静的 export / GitHub Pages |

このリポジトリは `output: "export"` のため、動的な POST Route Handler やサーバー上の
ファイル保存は採用しない。学習データの正本は端末・ブラウザ単位とし、旧版の
`progress.json` は「読み込み」から一度取り込む。別端末への移動やバックアップは
「書き出し」で同じ形式の JSON を保存する。

## 守る境界

- `components/ui/*` は編集せず、既存の shadcn/base-ui API を利用する。
- 問題本文は `lib/python-test/questions.js` を正本とする。
- JSON 読み込み時は `stats` と `flags` を境界で正規化し、不正な値を状態へ入れない。
- 将来アカウント同期が必要になった場合は、静的 hosting から独立した認証付き API を先に決める。
