export type FlowAction = {
  label: string
  target: string
  primary?: boolean
}

export type ScreenContent = {
  title: string
  intro: string
  primaryAction?: string
}

export const studioContent = {
  message: "AI Design System Studio は、brief を実装可能な UI へ変換する判断を、契約と検証結果で追跡可能にするデザインシステムです。",
  globalNavigation: [
    { label: "Overview", target: "overview" },
    { label: "Patterns", target: "pattern-library" },
    { label: "Studio", target: "studio-composer" },
    { label: "Quality", target: "quality-report" },
    { label: "Case Study", target: "case-study" },
  ],
  actionsByStep: {
    orientation: [
      { label: "Overview を見る", target: "overview", primary: true },
      { label: "オリエンテーションをスキップ", target: "overview" },
    ],
    overview: [
      { label: "Reviewer tour を始める", target: "pattern-library", primary: true },
      { label: "Studio を開く", target: "studio-composer" },
      { label: "品質を見る", target: "quality-report" },
      { label: "契約を調べる", target: "contract-explorer" },
      { label: "Coverage を見る", target: "coverage-matrix" },
      { label: "オリエンテーションを見る", target: "orientation" },
    ],
    "pattern-library": [{ label: "Pattern の詳細を見る", target: "pattern-detail", primary: true }],
    "pattern-detail": [
      { label: "実画面で見る", target: "live-demo", primary: true },
      { label: "Patterns に戻る", target: "pattern-library" },
      { label: "選定理由を見る", target: "selection-rationale" },
    ],
    "live-demo": [{ label: "品質レポートへ進む", target: "quality-report", primary: true }],
    "quality-report": [
      { label: "Case Study を読む", target: "case-study", primary: true },
      { label: "Provenance を確認する", target: "provenance-trail" },
      { label: "契約を調べる", target: "contract-explorer" },
    ],
    "studio-composer": [
      { label: "Flow を生成する", target: "flow-checkpoint", primary: true },
      { label: "AI に相談する", target: "ai-assistant" },
    ],
    "ai-assistant": [
      { label: "Flow を生成する", target: "flow-checkpoint", primary: true },
      { label: "brief に反映する", target: "studio-composer" },
    ],
    "flow-checkpoint": [{ label: "承認してレポートを見る", target: "result-report", primary: true }],
    "result-report": [
      { label: "生成された UI を見る", target: "generated-preview", primary: true },
      { label: "選定した Pattern を開く", target: "pattern-detail" },
      { label: "選定理由を見る", target: "selection-rationale" },
    ],
    "generated-preview": [
      { label: "選定した Pattern を開く", target: "pattern-detail", primary: true },
      { label: "選定理由を見る", target: "selection-rationale" },
    ],
    "selection-rationale": [{ label: "選定した Pattern を開く", target: "pattern-detail", primary: true }],
    "contract-explorer": [{ label: "選定した Pattern を開く", target: "pattern-detail", primary: true }],
    "provenance-trail": [{ label: "Quality に戻る", target: "quality-report", primary: true }],
    "coverage-matrix": [{ label: "Pattern の詳細を見る", target: "pattern-detail", primary: true }],
    "case-study": [],
  } satisfies Record<string, readonly FlowAction[]>,
  screens: {
    orientation: { title: "AI Design System Studio へようこそ", intro: "brief から検証済み UI まで、判断の根拠をたどれます。", primaryAction: "Overview を見る" },
    overview: { title: "AI が UI を選ぶ理由まで、追跡可能にする。", intro: "intent、契約、pattern、実装、検証を一つの流れとして公開します。", primaryAction: "Reviewer tour を始める" },
    "pattern-library": { title: "再利用可能な UI 在庫", intro: "ScreenType と blockRole から、使える pattern と状態を絞り込みます。", primaryAction: "Pattern の詳細を見る" },
    "pattern-detail": { title: "Pattern の構成と適用条件", intro: "この pattern が担う役割、構成 block、対応状態、検証記録を確認できます。", primaryAction: "実画面で見る" },
    "live-demo": { title: "実装された画面を確認する", intro: "default・loading・empty・error を含む実装状態を、画面として確認します。", primaryAction: "品質レポートへ進む" },
    "quality-report": { title: "品質は、再現できる根拠で示す。", intro: "契約検証、型検査、a11y、Storybook を通じた証拠と、未実施の人間レビューを分けて表示します。", primaryAction: "Case Study を読む" },
    "case-study": { title: "判断を残すことも、設計の一部。", intro: "画面在庫を増やすより、選定理由と検証可能性を先に設計した背景を説明します。" },
    "studio-composer": { title: "brief を、実装可能な判断材料へ。", intro: "目的・対象者・必要な操作を入力し、FlowSpec の出発点を作ります。", primaryAction: "Flow を生成する" },
    "ai-assistant": { title: "AI は提案し、人間が決める。", intro: "AI は不足している条件や候補を説明します。最終的な承認と公開判断は人間が行います。", primaryAction: "Flow を生成する" },
    "flow-checkpoint": { title: "この flow を進めますか？", intro: "解決した ScreenType、選定した pattern、前提とリスクを確認してから次へ進みます。", primaryAction: "承認してレポートを見る" },
    "result-report": { title: "選定結果と、その根拠", intro: "FlowSpec から解決した pattern、未解決項目、検証結果を同じレポートで確認します。", primaryAction: "生成された UI を見る" },
    "generated-preview": { title: "選定結果は、動く画面になる。", intro: "選定済み pattern を使った実装と、対応する状態を確認します。", primaryAction: "選定した Pattern を開く" },
    "selection-rationale": { title: "なぜ、この pattern なのか。", intro: "intent・データ形状・操作・状態・アクセシビリティを基準に、候補の適合性を比較します。", primaryAction: "選定した Pattern を開く" },
    "contract-explorer": { title: "判断を受け渡すための4つの契約", intro: "FlowSpec、SelectionSpec、BuildReport、facets が、実装のどの判断を固定するか確認します。", primaryAction: "選定した Pattern を開く" },
    "provenance-trail": { title: "主張の出どころを追跡する", intro: "生成物、入力、検証コマンド、結果を結び、再現できる形で表示します。", primaryAction: "Quality に戻る" },
    "coverage-matrix": { title: "UI 在庫の coverage", intro: "ScreenType と blockRole ごとの在庫・成熟度・検証状態を確認し、詳細へ移動できます。", primaryAction: "Pattern の詳細を見る" },
  } satisfies Record<string, ScreenContent>,
} as const
