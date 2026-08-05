"use client"

// Route: /overview. Owns ExampleAppsSection and SystemFlow — both are used
// only from here.

import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CodeIcon,
  LayoutGridIcon,
  MessageCircleIcon,
} from "lucide-react"
import { PricingPlanCard } from "@/components/blocks/pricing-plan-card-01"
import { Badge } from "@react-shadcn/shadcn-kit/ui/badge"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import { Card, CardContent, CardFooter } from "@react-shadcn/shadcn-kit/ui/card"
import { builtExampleApps } from "@/lib/studio-portfolio/app-spec"
import { studioContent } from "@/lib/studio-portfolio/studio-content"
import { studioScenarios } from "@/lib/studio-portfolio/studio-scenarios"
import data from "@/lib/studio-portfolio/studio-portfolio-data.json"
import {
  PageFrame,
  useStudioBasePath,
  SectionHeader,
} from "./studio-page-shell"

const EXAMPLE_APPS_CARD_WIDTH = 288

const EXAMPLE_APPS_VIEWPORT_DEFAULT = 1280

const EXAMPLE_APPS_VIEWPORT: Record<string, number> = {
  "member-gate": 820,
}

function ExampleAppsSection() {
  const basePath = useStudioBasePath()
  const marqueeApps = [...builtExampleApps, ...builtExampleApps]

  return (
    <section aria-labelledby="example-apps-heading">
      <SectionHeader
        id="example-apps-heading"
        title="Example apps"
        description="このシステムが選定・実装した、実際に操作できるアプリの例です。"
        actionHref={builtExampleApps[0]?.route ?? "/examples"}
        actionLabel="最初の例を開く"
      />
      <div className="group relative mx-auto w-4/5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_35%,black_65%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_35%,black_65%,transparent)]">
        <div className="flex w-max animate-[example-apps-marquee_50s_linear_infinite]">
          {marqueeApps.map((app, index) => (
            <Link
              key={`${app.id}-${index}`}
              href={app.route}
              data-open-window
              aria-hidden={index >= builtExampleApps.length}
              tabIndex={index >= builtExampleApps.length ? -1 : undefined}
              className="group/card mr-6 flex w-72 shrink-0 flex-col overflow-hidden rounded-lg transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted/20">
                {app.previewRoute && basePath !== null ? (
                  (() => {
                    const viewportWidth =
                      EXAMPLE_APPS_VIEWPORT[app.id] ?? EXAMPLE_APPS_VIEWPORT_DEFAULT
                    const viewportHeight = Math.round((viewportWidth * 10) / 16)
                    return (
                      <iframe
                        title={app.label}
                        src={`${basePath}${app.previewRoute}/`}
                        loading="lazy"
                        tabIndex={-1}
                        scrolling="no"
                        style={{
                          width: viewportWidth,
                          height: viewportHeight,
                          transform: `scale(${EXAMPLE_APPS_CARD_WIDTH / viewportWidth})`,
                        }}
                        className="pointer-events-none absolute top-0 left-0 origin-top-left border-0 bg-background"
                      />
                    )
                  })()
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {app.label}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <span className="font-medium">{app.label}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{app.screenType}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {app.selectedPattern}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`@keyframes example-apps-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  )
}

const systemFlowUsedBlocks = [
  "summary-metric-row-01",
  "chart-panel-01",
  "data-table-panel-01",
]

function SystemFlow() {
  const basePath = useStudioBasePath()
  const scenario = studioScenarios.find((item) => item.id === "operations-overview")!
  const dashboardApp = builtExampleApps.find(
    (app) => app.selectedPattern === "dashboard-01"
  )
  const dashboardPreviewSrc =
    basePath !== null && dashboardApp?.previewRoute
      ? `${basePath}${dashboardApp.previewRoute}/`
      : ""

  return (
    <Card>
      <CardContent>
        <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.4fr]">
          <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              1. 作りたいものを伝える
            </span>
            <p className="text-sm leading-6">「{scenario.brief}」</p>
          </div>

          <ArrowRightIcon
            aria-hidden="true"
            className="hidden size-5 shrink-0 self-center text-muted-foreground sm:block"
          />

          <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LayoutGridIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              2. 画面の組み立てを選ぶ
            </span>
            <div className="flex flex-wrap gap-1.5">
              {systemFlowUsedBlocks.map((name) => (
                <Badge key={name} variant="outline" className="font-mono text-[11px]">
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          <ArrowRightIcon
            aria-hidden="true"
            className="hidden size-5 shrink-0 self-center text-muted-foreground sm:block"
          />

          <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-4">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CodeIcon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              3. コードとして実装
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" aria-hidden="true" />
              Dashboard 01
            </span>
          </div>

          <ArrowRightIcon
            aria-hidden="true"
            className="hidden size-5 shrink-0 self-center text-muted-foreground sm:block"
          />

          <div className="flex flex-col gap-2 overflow-hidden rounded-lg bg-muted/30 p-2">
            <span className="px-2 pt-1 text-xs font-medium text-muted-foreground">
              4. できあがった画面
            </span>
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-background">
              {dashboardPreviewSrc ? (
                <iframe
                  title="Dashboard 01"
                  src={dashboardPreviewSrc}
                  loading="lazy"
                  tabIndex={-1}
                  className="pointer-events-none absolute top-0 left-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0 bg-background"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Dashboard 01
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href="/studio" data-open-window />}>
          Studioで見る <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  )
}

export function OverviewPage() {
  return (
    <PageFrame
      title="AI Design System Studio"
      description={studioContent.message}
    >
      <div className="space-y-10">
        <ExampleAppsSection />

        <section aria-labelledby="system-flow-heading">
          <SectionHeader
            id="system-flow-heading"
            title="システムの流れ"
            description="briefから実装まで、選定と検証の根拠を実際の成果物でたどれます。"
          />
          <SystemFlow />
        </section>

        <section aria-labelledby="patterns-inventory-heading">
          <SectionHeader
            id="patterns-inventory-heading"
            title="Patterns inventory"
            description="ScreenType・blockRole・registryパターンとして蓄積された在庫です。"
            actionHref="/patterns"
            actionLabel="実際に確認する"
          />
          {/*
            在庫数を3枚並べて見せるだけの用途で、選択 UI ではない。
            showAction={false} で選択ボタン自体が描画されないため onSelectPlan は
            呼ばれず、selectedPlanId も常に未選択でよい。どちらも必須 prop を
            満たすためだけに置いている。
          */}
          <PricingPlanCard
            selectedPlanId=""
            onSelectPlan={() => {}}
            showAction={false}
            plans={[
              {
                id: "screen-types",
                name: "ScreenTypes",
                price: String(data.inventory.screenTypes),
                period: "types",
                features: [],
                preview: (
                  <div className="inventory-preview h-28 overflow-hidden rounded-md border border-transparent bg-muted/20 p-2">
                    <div className="flex h-full gap-2">
                      <div className="w-8 rounded bg-primary/20" />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="h-3 w-1/3 rounded bg-primary/20" />
                        <div className="grid flex-1 grid-cols-3 gap-1.5">
                          <div className="rounded bg-primary/20" />
                          <div className="rounded bg-primary/20" />
                          <div className="rounded bg-primary/20" />
                        </div>
                        <div className="h-5 rounded bg-primary/20" />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "block-roles",
                name: "blockRoles",
                price: String(data.inventory.blockRoles),
                period: "roles",
                features: [],
                preview: (
                  <div className="inventory-preview grid h-28 grid-cols-3 gap-2 rounded-md border border-transparent bg-muted/20 p-2">
                    <div className="rounded bg-primary/20" />
                    <div className="rounded bg-muted" />
                    <div className="rounded bg-muted" />
                  </div>
                ),
              },
              {
                id: "registry-items",
                name: "Registry items",
                price: String(data.inventory.registryItems),
                period: "patterns",
                features: [],
                preview: (
                  <div className="inventory-preview h-28 overflow-hidden rounded-md border border-transparent bg-muted/20 p-2">
                    <div className="h-3 w-2/5 rounded bg-muted" />
                    <div className="mt-2 space-y-1.5">
                      {["one", "two", "three", "four"].map((row) => (
                        <div key={row} className="grid grid-cols-[1fr_1.5fr_1fr] gap-1.5">
                          <div className="h-3 rounded bg-muted" />
                          <div className="h-3 rounded bg-muted" />
                          <div className="h-3 rounded bg-primary/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </section>
      </div>

      <p className="text-xs text-muted-foreground">
        inventoryはexperimentalを含みます。自動検証のpassは、UX・内容・maturityに対する人間レビューを代替しません。
      </p>
    </PageFrame>
  )
}
