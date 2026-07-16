<!-- encoding:UTF-8 -->

# Team T app library

Team T アプリ専用のデータ、型、fixture、純粋な業務ロジックを置く。

## 索引

- 直下の子は、ドメインまたはデータ境界が確定した時点でこの索引へ追加する

## このディレクトリだけの約束

- React component と Next.js route module に依存しない
- UI表示用の派生値と、ドメイン上の正本データを区別する
- 外部入力は境界で検証し、認証・認可が必要な操作をクライアント状態だけで保証しない
- fixture、browser storage、外部APIのどれを正本にするかを曖昧にせず、対応する文書へ記録する
