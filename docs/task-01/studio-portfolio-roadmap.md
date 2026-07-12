'''
encoding:"UTF-8"
'''

# Studio Portfolio 完成ロードマップ

`studio-portfolio-01` を、画面在庫と遷移を示すプロトタイプから、AI Design System の価値を短時間で検証できる公開ポートフォリオへ仕上げるための実装順序。

## 完成の定義

- 初見の採用担当者が3〜5分で「何を実証した作品か」を理解できる。
- デザイナー／開発者が ScreenType・block pattern と選定理由を実例から辿れる。
- 技術評価者が FlowSpec・SelectionSpec・BuildReport と検証結果を実ファイルに基づいて確認できる。
- 表示する数値、名称、リンク、検証結果は、リポジトリの正本データと一致する。

## 実装の流れ

### 1. 作品の主張と読者別の到達点を確定する

作品の中心メッセージを「AI が brief → JTBD → FlowSpec → pattern 選定 → 実装 → 検証を、契約で追跡可能な形に分解するデザインシステム」とする。

- 採用担当者: 独自性と完成度を短時間で把握する。
- デザイナー／開発者: 再利用可能な画面・block と選定根拠を確認する。
- 技術評価者: 契約、provenance、検証結果を再現・検証する。

成果物: 各画面の目的、見出し、導入文、主要CTAを定義したコンテンツ設計。

完了: [Studio Portfolio コンテンツ設計](studio-portfolio-content-design.md) を正本として作成済み。次はこの内容を build-time データへ実装する。

### 2. 表示コンテンツの正本を作る

ポートフォリオ専用の build-time データを用意し、現在の registry・FlowSpec・SelectionSpec・BuildReport から導出できる情報を集約する。

- registry 件数、ScreenType／blockRole の coverage、maturity。
- `dryrun-saas-ops-01` と `studio-portfolio-01` の FlowSpec・SelectionSpec・BuildReport。
- pattern の役割、構成 block、状態、Storybook deep-link。
- 検証コマンドと成功結果。

成果物: 文言・数値・リンクの出典を一箇所に持ち、画面が仮のダッシュボード値に依存しない状態。

### 3. Reviewer Discovery を完成させる

`Overview → Pattern Library → Pattern Detail → Live Demo → Quality Report → Case Study` を、最初の主要体験として完成させる。

- Overview: 作品の要約、実証済みの範囲、入口を示す。
- Pattern Library / Detail: 検索・絞り込み、構成 block、状態、Storybook と実画面への導線を示す。
- Live Demo / Quality / Case Study: 実画面、品質根拠、設計判断を一貫して示す。

成果物: 採用担当者がこの経路だけで作品を評価できる。

### 4. Studio Pipeline を完成させる

`Studio Composer → AI Assistant（任意）→ Flow Checkpoint → Result Report → Generated Preview / Selection Rationale` を、一本の具体例でつなぐ。

- サンプル brief を一つ選び、途中で使う用語とデータを固定する。
- FlowSpec、選定候補・却下候補、BuildReport、生成画面を同じ example に対応させる。
- 人間確認ゲートと、AI が自動で決めない範囲を明示する。

成果物: 「brief から動く UI まで」の説明が、画面間で矛盾しない。

### 5. Evaluator Deep-Dive を完成させる

`Contract Explorer → Provenance Trail → Coverage Matrix` で、主張をリポジトリの成果物へ結び付ける。

- 4種の契約スキーマと各成果物の関係を説明する。
- provenance と検証結果を読みやすく表示する。
- coverage を pattern detail への探索導線にする。

成果物: 技術評価者が品質主張を実ファイル・コマンドへ遡れる。

### 6. 整合性を自動検証し、公開品質へ仕上げる

- 表示件数・pattern 名・リンク・FlowSpec transition と正本データの一致を検証する。
- default / loading / empty / error、キーボード操作、モバイル表示を確認する。
- GitHub Pages の静的エクスポート、base path、Storybook deep-link を実環境で確認する。
- 初見の閲覧者による3〜5分のレビューを受け、コピーと導線を調整する。

成果物: 公開 URL と、再現可能な `npm run validate` / `npm run checks` の結果。

## 実施順序

上から順に実装する。次の工程へ進む条件は、前工程の成果物がポートフォリオ内で実際に参照され、文言・数値・遷移先が矛盾しないこと。
