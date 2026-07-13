import flowSpec from "@/docs/examples/flowspec-studio-portfolio-01.json"
import selectionSpec from "@/docs/examples/selectionspec-studio-portfolio-01.json"
import buildReport from "@/docs/examples/buildreport-studio-portfolio-01.json"
import provenance from "@/docs/examples/buildreport-studio-portfolio-01.provenance.json"
import flowSpecSchema from "@/docs/contracts/ai-flowspec.schema.json"
import selectionSpecSchema from "@/docs/contracts/ai-selectionspec.schema.json"
import buildReportSchema from "@/docs/contracts/ai-buildreport.schema.json"
import facetsSchema from "@/docs/contracts/ai-design-facets.schema.json"

type RejectedCandidate = {
  registryItem?: string
  score?: number
}

export const studioEvidence = {
  flowSteps: flowSpec.steps.map((step) => ({
    id: step.stepId,
    intents: step.userIntents,
    states: step.requiredStates,
    transitions: Object.values(step.transitions ?? {}),
  })),
  selections: selectionSpec.screens.map((screen) => ({
    stepId: screen.stepId,
    screenType: screen.resolvedScreenType,
    pattern: screen.screenPattern.registryItem,
    score: screen.screenPattern.score,
    screenTypeScore: screen.screenTypeScore,
    blocks: screen.blocks.map((block) => block.registryItem),
    blockScores: screen.blocks.map((block) => ({ role: block.blockRole, registryItem: block.registryItem, score: block.score })),
    rejected: (screen.screenPattern.rejected ?? []) as RejectedCandidate[],
    assumptions: screen.assumptions,
    risks: screen.risks,
  })),
  checks: buildReport.checks,
  build: {
    status: buildReport.status,
    screens: buildReport.screens.length,
    unresolved: buildReport.unresolved.length,
  },
  provenance: {
    flowDigest: provenance.inputs.flowSpec.digest,
    selectionDigest: provenance.inputs.selectionSpec.digest,
    buildDigest: provenance.inputs.buildReport.digest,
    registryDigest: provenance.inputs.registryInventory.digest,
    registryItems: provenance.inputs.registryInventory.items,
  },
  contracts: [
    {
      name: "FlowSpec",
      responsibility: "ユーザー意図、状態、遷移を固定する入力契約",
      input: "Brief（上流の人間+AI）",
      output: "SelectionSpec（選定レイヤーへ）",
      schemaFile: "docs/contracts/ai-flowspec.schema.json",
      required: flowSpecSchema.required,
    },
    {
      name: "SelectionSpec",
      responsibility: "ScreenType・pattern・blockの選定根拠を固定する契約",
      input: "FlowSpec + registry inventory",
      output: "BuildReport（実装レイヤーへ）",
      schemaFile: "docs/contracts/ai-selectionspec.schema.json",
      required: selectionSpecSchema.required,
    },
    {
      name: "BuildReport",
      responsibility: "作成物と自動チェックの結果を記録する出力契約",
      input: "SelectionSpec + build/check 実行",
      output: "provenance sidecar・検証記録",
      schemaFile: "docs/contracts/ai-buildreport.schema.json",
      required: buildReportSchema.required,
    },
    {
      name: "Facets",
      responsibility: "在庫を比較可能にする語彙とメタデータ",
      input: "registry item の meta.aiDesignSystem",
      output: "全契約が参照する共有語彙",
      schemaFile: "docs/contracts/ai-design-facets.schema.json",
      required: facetsSchema.required,
    },
  ],
} as const
