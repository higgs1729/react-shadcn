"use client"

// Route: /quality

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@react-shadcn/shadcn-kit/ui/tabs"
import { studioEvidence } from "@/lib/studio-portfolio/evidence"
import data from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { PageFrame, QualityFieldsCard } from "./studio-page-shell"

export function QualityPage() {
  return (
    <PageFrame
      title="Quality"
      description="品質の主張を、契約・生成物・来歴まで遡って確認します。"
      centered
    >
      <div className="space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          brief から画面ができるまでの各段階(FlowSpec → SelectionSpec →
          BuildReport)は、それぞれ「契約」として内容が固定されています。契約は
          JSON
          Schemaで書かれ、ajvという検証ツールが次の段階へ進む前に機械的に形式を確認するため、ルールから外れた内容が途中で紛れ込むことはありません。
        </p>
        <p>
          さらに生成物には provenance
          sidecarという記録が添えられます。これは入力ファイルの
          digest(内容から計算した指紋のようなもの)を保存する仕組みで、後から入力が書き換えられていないかを機械的に照合できます。「この画面はこのbriefと選定結果から作られた」という対応関係を、見た目ではなく検証可能な形で示します。
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Coverage matrix</CardTitle>
            <CardDescription>
              ScreenType・blockRoleの在庫が網羅されているかを確認します。
            </CardDescription>
          </div>
          <div className="space-y-2">
            {[
              { label: "screenTypes", value: data.inventory.screenTypes },
              { label: "blockRoles", value: data.inventory.blockRoles },
              { label: "registryItems", value: data.inventory.registryItems },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
                  {stat.label}
                </span>
                <div className="h-4 flex-1 overflow-hidden rounded-sm bg-muted/40">
                  <div
                    className="h-full rounded-sm bg-primary/70 transition-colors hover:bg-primary"
                    style={{
                      width: `${(stat.value / data.inventory.registryItems) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/quality/coverage" />}
          >
            開く <ArrowRightIcon />
          </Button>
        </CardContent>
      </Card>
      <div id="quality-detail">
        <Tabs defaultValue="contract-explorer">
          <TabsList>
            <TabsTrigger value="contract-explorer">
              Contract explorer
            </TabsTrigger>
            <TabsTrigger value="provenance-trail">Provenance trail</TabsTrigger>
          </TabsList>
          <TabsContent value="contract-explorer" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              各段階を固定する4つの契約スキーマの内容を確認します。
            </p>
            {studioEvidence.contracts.map((contract) => (
              <div key={contract.name} className="space-y-2">
                <QualityFieldsCard
                  title={contract.name}
                  status="Source of truth"
                  fields={[
                    {
                      id: "responsibility",
                      label: "Responsibility",
                      value: contract.responsibility,
                    },
                    { id: "input", label: "Input", value: contract.input },
                    { id: "output", label: "Output", value: contract.output },
                    {
                      id: "schema",
                      label: "Schema",
                      value: contract.schemaFile,
                    },
                  ]}
                />
                <pre className="max-w-2xl overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-xs dark:bg-card">
                  {JSON.stringify(
                    {
                      $schema: contract.schemaFile,
                      required: contract.required,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="provenance-trail" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              入力とregistryのdigestが、成果物とどう結びつくかを確認します。
            </p>
            <QualityFieldsCard
              title="buildreport-studio-portfolio-01"
              status={studioEvidence.build.status}
              fields={[
                {
                  id: "flow",
                  label: "FlowSpec",
                  value: studioEvidence.provenance.flowDigest,
                },
                {
                  id: "selection",
                  label: "SelectionSpec",
                  value: studioEvidence.provenance.selectionDigest,
                },
                {
                  id: "build",
                  label: "BuildReport",
                  value: studioEvidence.provenance.buildDigest,
                },
                {
                  id: "registry",
                  label: "Registry",
                  value: studioEvidence.provenance.registryDigest,
                },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              selection-scoped registry items:{" "}
              {studioEvidence.provenance.registryItems.join(", ")}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </PageFrame>
  )
}
