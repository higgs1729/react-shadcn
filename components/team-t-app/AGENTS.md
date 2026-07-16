<!-- encoding:UTF-8 -->

# Team T app components

Team T アプリ専用の UI 実体を置く。

## 索引

- 直下の子は、機能または安定した UI 領域が実装された時点でこの索引へ追加する

## このディレクトリだけの約束

- `components/ui/*` は編集せず、公開 API を利用する
- registry 在庫を変更せず、Team T 固有の composition と content binding をこの階層で行う
- component は必要な状態を props で再現できるようにし、状態ごとの story と検証を同じ vertical slice で追加する
- route、データ取得、永続化を UI component へ直接埋め込まない
