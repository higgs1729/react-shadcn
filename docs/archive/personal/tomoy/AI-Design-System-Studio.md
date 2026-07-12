```
encoding:'UTF-8'
```

Brief
プロダクト名（仮）: AI Design System Studio
目的:
briefからJTBD、FlowSpec、パターン選定、実装、検証までを、動く画面とともに説明する公開ポートフォリオ。

Storybookは部品単位の実験室として残し、本体アプリは統合された体験、選定理由、ケーススタディを見せる場所にします。
対象者は次の3者です。
3〜5分で候補者を評価する採用担当者
画面・ブロックの再利用性を確認するデザイナー／開発者
AI実装の契約と品質保証を確認する技術評価者
JTBD
短時間でプロジェクトの独自性を理解する
画面・ブロックパターンを実例から探索する
briefがUIへ変換される工程を体験する
品質や完成度の主張を検証する
機能分解
P0のポートフォリオ本体:
コンセプトと設計思想の紹介
registry件数とカバレッジの動的表示
screen／blockパターンの検索・絞り込み
パターン詳細と構成blockの表示
default／loading／empty／errorの切り替え
golden flowのガイド付き体験
FlowSpec／SelectionSpec／BuildReportの段階的開示
QualityとCase Studyの表示
P1の発展機能:
サンプルbriefの選択・編集
AIアシスタント形式の説明
生成されたフローの確認
パターン選定と却下候補の比較
結果レポートから実画面への移動
公開アプリからregistryを編集したり、maturityを昇格したり、任意の本番アプリを生成する機能は含めません。
情報設計
グローバルナビゲーションは5項目に絞ります。
Overview：これは何で、何が実証済みか
Patterns：どんな画面とblockがあるか
Studio：briefがどうUIになるか
Quality：品質を信用できる根拠は何か
Case Study：なぜこの設計にしたか
主要フロー
Reviewer Discovery
Overview
→ Pattern Library
→ Pattern Detail
→ Live Demo
→ Quality Report
→ Case Study
採用担当者向けの標準3〜5分コースです。
First Visit
Optional Orientation
→ brief→verified UIの説明
→ Overview
ガイドはスキップ可能にし、閲覧を妨げないようにします。
Studio Pipeline
Brief Composer
→ AI Assistant（任意）
→ Flow Checkpoint
→ Result Report
→ Selected Pattern Detail
デザインシステム固有の価値を最も強く見せるフローです。
想定ScreenType
Overview → dashboard
Pattern Library → collection
Pattern Detail → detail
Orientation → onboarding
Brief Composer → create-edit
Flow Checkpoint → workflow
AI Assistant → conversation-assistant
Quality／Result → report-analytics
これは選定結果ではなく上流仮説です。実際のscreenTypeはFlowSpecのfacetから選定レイヤーに解決させます。
Product Designの整理手順により、見栄えのために全screenTypeを無理やり使用せず、実際のJTBDがある機能だけを本体に採用する方針にしています。残りはPattern Gallery内のデモとして紹介します。
次は利用上限の解除後、この定義と3本のFlowSpecを docs/layers/10-upstream/ に保存してスキーマ検証します。