"use client"

// Route: /studio — the step-by-step workspace.

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { CollectionGrid } from "@/components/blocks/collection-grid-01"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import { studioScenarios } from "@/lib/studio-portfolio/studio-scenarios"
import { PageFrame, QualityFieldsCard } from "./studio-page-shell"

type StudioStepId =
  | "brief"
  | "flow-spec"
  | "selection-spec"
  | "build-report"
  | "ui-preview"

const studioSteps: { id: StudioStepId; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "flow-spec", label: "FlowSpec" },
  { id: "selection-spec", label: "SelectionSpec" },
  { id: "build-report", label: "BuildReport" },
  { id: "ui-preview", label: "UI preview" },
]

export function StudioPage() {
  const [selectedId, setSelectedId] = useState(studioScenarios[0].id)
  const [selectedStepId, setSelectedStepId] = useState<StudioStepId>("brief")
  const selectedScenario =
    studioScenarios.find((scenario) => scenario.id === selectedId) ??
    studioScenarios[0]

  return (
    <PageFrame
      title="Studio"
      description="実行時にAIが生成する画面ではありません。実在するpatternへ結びつけた、選択式の静的サンプルで判断の流れを確認します。"
    >
      <section aria-labelledby="scenario-heading">
        <h2 id="scenario-heading" className="mb-3 text-base font-medium">
          確認したいことを選ぶ
        </h2>
        <CollectionGrid
          selectedId={selectedId}
          onItemSelect={setSelectedId}
          items={studioScenarios.map((scenario) => ({
            id: scenario.id,
            title: scenario.title,
            description: scenario.brief,
            badge: scenario.flowSpec.primaryScreenType,
          }))}
        />
      </section>

      <section aria-labelledby="trace-heading">
        <h2 id="trace-heading" className="mb-4 text-lg font-medium">
          判断の記録を辿る
        </h2>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex gap-3 overflow-x-auto pb-1 lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {studioSteps.map((step, index) => {
              const isSelected = step.id === selectedStepId
              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${isSelected ? "border-primary bg-primary/8" : "bg-card hover:bg-muted/50"}`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-base font-medium whitespace-nowrap">
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="min-w-0 flex-1">
            {selectedStepId === "brief" ? (
              <QualityFieldsCard
                title="Brief"
                status="Selected sample"
                fields={[
                  {
                    id: "request",
                    label: "Request",
                    value: selectedScenario.brief,
                  },
                  {
                    id: "outcome",
                    label: "Expected outcome",
                    value: selectedScenario.outcome,
                  },
                ]}
              />
            ) : selectedStepId === "flow-spec" ? (
              <QualityFieldsCard
                title="FlowSpec"
                status="Prebuilt"
                fields={[
                  {
                    id: "intent",
                    label: "User intent",
                    value: selectedScenario.flowSpec.userIntent,
                  },
                  {
                    id: "type",
                    label: "ScreenType",
                    value: selectedScenario.flowSpec.primaryScreenType,
                  },
                  {
                    id: "state",
                    label: "Required state",
                    value: selectedScenario.flowSpec.requiredState,
                  },
                ]}
              />
            ) : selectedStepId === "selection-spec" ? (
              <QualityFieldsCard
                title="SelectionSpec"
                status="Prebuilt"
                fields={[
                  {
                    id: "pattern",
                    label: "Screen pattern",
                    value: selectedScenario.selectionSpec.screenPattern,
                  },
                  {
                    id: "reason",
                    label: "Why this pattern",
                    value: selectedScenario.selectionSpec.reason,
                  },
                ]}
              />
            ) : selectedStepId === "build-report" ? (
              <QualityFieldsCard
                title="BuildReport"
                status={selectedScenario.buildReport.status}
                fields={[
                  {
                    id: "pattern",
                    label: "Built as",
                    value: selectedScenario.selectionSpec.screenPattern,
                  },
                  {
                    id: "checks",
                    label: "Checks passed",
                    value: selectedScenario.buildReport.checksPassed.join(" / "),
                  },
                ]}
              />
            ) : (
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>UI previewを確認する</CardTitle>
                  <CardDescription>
                    選定されたpatternのStorybookを開き、実装済みのdefaultと状態別previewを確認します。
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    render={
                      <Link
                        href={`/patterns?panel=live-demo&pattern=${selectedScenario.selectionSpec.screenPattern}`}
                        data-open-window
                      />
                    }
                  >
                    {selectedScenario.outcome} <ArrowRightIcon />
                  </Button>
                  <Button
                    variant="outline"
                    render={
                      <Link
                        href={`/patterns?panel=pattern-detail&pattern=${selectedScenario.selectionSpec.screenPattern}`}
                        data-open-window
                      />
                    }
                  >
                    選定の詳細を見る
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        この画面は静的ポートフォリオです。入力から新しいFlowSpec・SelectionSpec・UIを生成したり、外部AIへ問い合わせたりはしません。
      </p>
    </PageFrame>
  )
}

// DetailOverview(registry pattern)は値が右端寄せで、ラベルと値の距離が遠い。
// Quality の契約/来歴表示ではラベル直後に値を置きたいため、ローカル版を使う。
