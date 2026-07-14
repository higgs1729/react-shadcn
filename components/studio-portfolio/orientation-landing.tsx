"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { ActivityFeed } from "@/components/activity-feed-01"
import { AiExplainabilityLabel } from "@/components/ai-explainability-label-01"
import { BreadcrumbContext01 } from "@/components/breadcrumb-context-01"
import { FilterToolbar } from "@/components/filter-toolbar"
import { PricingPlanCard } from "@/components/pricing-plan-card-01"
import { SectionCards } from "@/components/section-cards"
import { WizardStepper } from "@/components/wizard-stepper-01"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import studioPortfolioData from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { studioContent } from "@/lib/studio-portfolio/studio-content"

const inventory = studioPortfolioData.inventory

function ShowcaseBlock({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {title ? (
        <p className="mb-3 text-xs font-medium text-muted-foreground">{title}</p>
      ) : null}
      {children}
    </div>
  )
}

export function OrientationLanding() {
  const screen = studioContent.screens.orientation

  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 md:px-6">
          <span className="text-sm font-medium">AI Design System Studio</span>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        <section className="flex flex-col items-center px-4 pb-16 pt-28 text-center md:pb-24 md:pt-36">
          <Badge variant="outline" className="gap-1 rounded-full px-3 py-1">
            AI Design System Studio
          </Badge>

          <h1 className="mt-8 max-w-4xl text-4xl font-bold tracking-tighter text-balance sm:text-5xl md:text-6xl lg:text-7xl">
            {screen.title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground text-balance md:text-lg md:leading-8">
            {screen.intro}
          </p>

          <div className="mt-10">
            <Button
              size="lg"
              className="h-11 rounded-full px-6"
              nativeButton={false}
              render={<Link href="/overview" />}
            >
              作品を見る
              <ArrowRightIcon />
            </Button>
          </div>
        </section>

        <section
          aria-hidden="true"
          className="relative mt-auto w-full px-4 pb-12 md:px-6 md:pb-16"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-24 z-10 h-24 bg-gradient-to-b from-transparent to-background" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background to-transparent" />

          <div className="pointer-events-none mx-auto grid max-w-6xl grid-cols-1 gap-4 opacity-90 select-none sm:grid-cols-2 lg:grid-cols-4">
            <ShowcaseBlock title="Pipeline" className="sm:col-span-2">
              <WizardStepper
                steps={[
                  { id: "brief", label: "Brief" },
                  { id: "flow-spec", label: "FlowSpec" },
                  { id: "selection", label: "Selection" },
                  { id: "build", label: "Build" },
                ]}
                currentStepId="selection"
                completedStepIds={["brief", "flow-spec"]}
              />
            </ShowcaseBlock>

            <ShowcaseBlock title="Inventory" className="sm:col-span-2">
              <SectionCards
                variant="compact"
                items={[
                  {
                    label: "ScreenTypes",
                    value: String(inventory.screenTypes),
                    summary: "",
                    detail: "canonical profiles",
                  },
                  {
                    label: "blockRoles",
                    value: String(inventory.blockRoles),
                    summary: "",
                    detail: "with inventory",
                  },
                  {
                    label: "Patterns",
                    value: String(inventory.registryItems),
                    summary: "",
                    detail: "registry items",
                  },
                  {
                    label: "Coverage",
                    value: "100%",
                    summary: "",
                    detail: "gap 0",
                  },
                ]}
              />
            </ShowcaseBlock>

            <ShowcaseBlock title="Pattern library">
              <FilterToolbar
                search="dashboard"
                onSearchChange={() => {}}
                status="screen-pattern"
                onStatusChange={() => {}}
                statusOptions={[
                  { value: "all", label: "All kinds" },
                  { value: "screen-pattern", label: "Screen patterns" },
                  { value: "block", label: "Blocks" },
                ]}
                view="grid"
                onViewChange={() => {}}
              />
            </ShowcaseBlock>

            <ShowcaseBlock title="Selection rationale">
              <div className="space-y-3">
                <AiExplainabilityLabel
                  label="Pattern selected"
                  confidence="high"
                  explanation="intent, data shape, and state coverage matched FlowSpec step requirements."
                />
                <p className="text-sm text-muted-foreground">
                  選定理由は契約と facet で固定され、BuildReport に引き継がれます。
                </p>
              </div>
            </ShowcaseBlock>

            <ShowcaseBlock title="Verification trail" className="sm:col-span-2">
              <ActivityFeed
                entries={[
                  {
                    id: "1",
                    actor: "validate:pipeline",
                    action: "SelectionSpec と registry の整合を確認",
                    timestamp: "pass",
                  },
                  {
                    id: "2",
                    actor: "run-planned-checks",
                    action: "a11y gate と story 実行",
                    timestamp: "16/16 pass",
                  },
                  {
                    id: "3",
                    actor: "report:coverage",
                    action: "ScreenType / blockRole gap 0",
                    timestamp: "verified",
                  },
                ]}
              />
            </ShowcaseBlock>

            <ShowcaseBlock title="Flow context" className="lg:col-span-2">
              <BreadcrumbContext01
                items={[
                  { id: "overview", label: "Overview", onSelect: () => {} },
                  { id: "patterns", label: "Patterns", onSelect: () => {} },
                ]}
                currentLabel="Pattern detail"
              />
            </ShowcaseBlock>

            <ShowcaseBlock title="Composition" className="sm:col-span-2 lg:col-span-4">
              <PricingPlanCard
                selectedPlanId="registry"
                onSelectPlan={() => {}}
                showAction={false}
                emphasizeAll
                plans={[
                  {
                    id: "screen-types",
                    name: "ScreenTypes",
                    price: String(inventory.screenTypes),
                    period: "types",
                    features: ["onboarding", "dashboard", "collection"],
                  },
                  {
                    id: "block-roles",
                    name: "blockRoles",
                    price: String(inventory.blockRoles),
                    period: "roles",
                    features: ["wizard-stepper", "filter-toolbar", "action-footer"],
                  },
                  {
                    id: "registry",
                    name: "Registry",
                    price: String(inventory.registryItems),
                    period: "patterns",
                    features: ["screen-pattern", "block", "experimental"],
                  },
                ]}
              />
            </ShowcaseBlock>
          </div>
        </section>
      </main>
    </div>
  )
}
