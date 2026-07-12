'''
encoding:"UTF-8"
'''

# Studio Portfolio コンテンツ設計

`studio-portfolio-01` の画面コピーと導線の正本。実装ではこの文書の見出し・導入文・主要CTAを基準にし、数値・pattern 名・検証結果は次工程の build-time データから表示する。

## 作品の主張

**AI Design System Studio は、brief を実装可能な UI へ変換する判断を、契約と検証結果で追跡可能にするデザインシステムである。**

AI が完成を宣言するのではない。AI は intent・データ形状・操作・状態を構造化し、既存 pattern を根拠とともに選定する。人間は確認ゲートで判断し、成果物と検証結果を再現できる。

## 読者と到達点

| 読者 | 閲覧後に理解してほしいこと | 最初の導線 |
| --- | --- | --- |
| 採用担当者 | 何を作り、どこまで実証済みか | Reviewer Discovery |
| デザイナー／開発者 | pattern をどう選び、どう再利用するか | Pattern Library |
| 技術評価者 | 主張をどの契約・成果物・検証で確かめるか | Quality / Contract Explorer |

## コピーの原則

- 主張は「verified」「experimental」「human review 未実施」を区別し、未証明の完成度を断言しない。
- 件数・スコア・pattern 名・状態・検証結果はハードコードせず、正本データの表示に置き換える。
- 画面固有の操作は FlowSpec transition に対応させる。グローバルナビは補助導線であり、ストーリーを置き換えない。
- 初期公開は日本語を正本にする。英語版は同じ message key を使う翻訳として追加し、日本語と別の主張を作らない。

## 共通ナビゲーション

| 項目 | 役割 | 移動先 |
| --- | --- | --- |
| Overview | 作品の要約と入口 | `overview` |
| Patterns | 在庫の探索 | `pattern-library` |
| Studio | brief から UI までの体験 | `studio-composer` |
| Quality | 品質根拠と検証 | `quality-report` |
| Case Study | 設計判断の総括 | `case-study` |

## 画面コンテンツ

| stepId / 画面 | 画面の役割 | 見出し | 導入文 | 主要CTA |
| --- | --- | --- | --- | --- |
| `orientation` / Orientation | 初回訪問者に作品の見方を渡す | AI Design System Studio へようこそ | brief から検証済み UI まで、判断の根拠をたどれます。 | 「Overview を見る」 |
| `overview` / Overview | 作品の要約と3つの入口 | AI が UI を選ぶ理由まで、追跡可能にする。 | intent、契約、pattern、実装、検証を一つの流れとして公開します。 | 「Reviewer tour を始める」 |
| `pattern-library` / Pattern Library | screen / block 在庫を探索する | 再利用可能な UI 在庫 | ScreenType と blockRole から、使える pattern と状態を絞り込みます。 | 「Pattern の詳細を見る」 |
| `pattern-detail` / Pattern Detail | 一つの pattern の構成と適合性を確認する | Pattern の構成と適用条件 | この pattern が担う役割、構成 block、対応状態、検証記録を確認できます。 | 「実画面で見る」 |
| `live-demo` / Live Demo | pattern が実画面でどう振る舞うか示す | 実装された画面を確認する | default・loading・empty・error を含む実装状態を、画面として確認します。 | 「品質レポートへ進む」 |
| `quality-report` / Quality | 自動検証と人間レビューの境界を示す | 品質は、再現できる根拠で示す。 | 契約検証、型検査、a11y、Storybook を通じた証拠と、未実施の人間レビューを分けて表示します。 | 「Case Study を読む」 |
| `case-study` / Case Study | なぜこの設計にしたかを総括する | 判断を残すことも、設計の一部。 | 画面在庫を増やすより、選定理由と検証可能性を先に設計した背景を説明します。 | なし（読了画面） |
| `studio-composer` / Studio | サンプル brief の入力と編集 | brief を、実装可能な判断材料へ。 | 目的・対象者・必要な操作を入力し、FlowSpec の出発点を作ります。 | 「Flow を生成する」 |
| `ai-assistant` / AI Assistant | AI が補助する範囲を説明する | AI は提案し、人間が決める。 | AI は不足している条件や候補を説明します。最終的な承認と公開判断は人間が行います。 | 「Flow を生成する」 |
| `flow-checkpoint` / Flow Checkpoint | 人間確認ゲートを示す | この flow を進めますか？ | 解決した ScreenType、選定した pattern、前提とリスクを確認してから次へ進みます。 | 「承認してレポートを見る」 |
| `result-report` / Result Report | 選定・実装・検証の結果を要約する | 選定結果と、その根拠 | FlowSpec から解決した pattern、未解決項目、検証結果を同じレポートで確認します。 | 「生成された UI を見る」 |
| `generated-preview` / Generated Preview | 選定結果が実画面になることを示す | 選定結果は、動く画面になる。 | 選定済み pattern を使った実装と、対応する状態を確認します。 | 「選定した Pattern を開く」 |
| `selection-rationale` / Selection Rationale | 候補比較と却下理由を説明する | なぜ、この pattern なのか。 | intent・データ形状・操作・状態・アクセシビリティを基準に、候補の適合性を比較します。 | 「選定した Pattern を開く」 |
| `contract-explorer` / Contract Explorer | 契約の関係を可視化する | 判断を受け渡すための4つの契約 | FlowSpec、SelectionSpec、BuildReport、facets が、実装のどの判断を固定するか確認します。 | 「選定した Pattern を開く」 |
| `provenance-trail` / Provenance Trail | 成果物の由来と検証を追えるようにする | 主張の出どころを追跡する | 生成物、入力、検証コマンド、結果を結び、再現できる形で表示します。 | 「Quality に戻る」 |
| `coverage-matrix` / Coverage Matrix | 在庫の充足と不足を探索する | UI 在庫の coverage | ScreenType と blockRole ごとの在庫・成熟度・検証状態を確認し、詳細へ移動できます。 | 「Pattern の詳細を見る」 |

## 主要ジャーニーの読後メッセージ

### Reviewer Discovery

`Overview → Pattern Library → Pattern Detail → Live Demo → Quality Report → Case Study`

「見た目のサンプル集ではなく、パターンの選定理由と品質根拠まで見せる作品である。」

### Studio Pipeline

`Studio Composer → AI Assistant（任意）→ Flow Checkpoint → Result Report → Generated Preview / Selection Rationale`

「AI は判断の材料を構造化し、承認可能な成果物にする。人間の判断を隠さない。」

### Evaluator Deep-Dive

`Quality Report → Contract Explorer / Provenance Trail / Coverage Matrix`

「表示された主張は、契約・成果物・検証コマンドまで遡って確認できる。」

## 次工程への入力

フェーズ2では、この文書の文言を message key として build-time データに実装し、次を正本から導出する。

- registry と facets からの在庫件数、maturity、pattern メタデータ。
- `docs/examples/` の FlowSpec・SelectionSpec・BuildReport と provenance。
- `verification.storybookStories` から作る Storybook deep-link。
- 検証コマンドと実行結果。
