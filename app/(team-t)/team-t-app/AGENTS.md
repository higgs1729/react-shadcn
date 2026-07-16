<!-- encoding:UTF-8 -->

# Team T app route

Team T アプリの route 階層。GitHub Pages では `/react-shadcn/team-t-app/` 以下として静的公開する。

## 索引

- `docs/` — Team T アプリの目的・アーキテクチャ・設計判断の正本
- `layout.tsx` — Team T アプリ専用 layout。必要になった段階で追加する
- `page.tsx` — Team T アプリの入口。最初の vertical slice 実装時に追加する

## このディレクトリだけの約束

- アプリ固有 UI は `components/team-t-app/`、データ・型・純粋な業務ロジックは `lib/team-t-app/` に置く
- 新しい route や大きな構造判断より先に、対応する決定を `docs/` の現在地へ反映する
- 現行 golden flow は画面候補と状態検証の補助として部分利用し、アプリ全体構造の正本にはしない
- GitHub Pages の静的 export 境界を守り、サーバー実行が必要な機能は代替または別ホストを決めるまで実装しない
- 最初から全画面を作らず、優先ユーザーフローごとに UI・データ・権限・状態・検証を通した vertical slice を完成させる
