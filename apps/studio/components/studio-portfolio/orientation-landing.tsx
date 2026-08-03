"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { ActivityFeed } from "@/components/blocks/activity-feed-01"
import { AiExplainabilityLabel } from "@/components/blocks/ai-explainability-label-01"
import { BreadcrumbContext01 } from "@/components/blocks/breadcrumb-context-01"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { SectionCards } from "@/components/blocks/section-cards"
import { WizardStepper } from "@/components/blocks/wizard-stepper-01"
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

const ORIENTATION_TITLE_ACCENT_CHARS = Array.from("再利用可能で説明可能なデザイン")

const orbitItems = [
  {
    id: "pipeline",
    title: "Pipeline",
    content: (
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
    ),
  },
  {
    id: "inventory",
    title: "Inventory",
    content: (
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
    ),
  },
  {
    id: "pattern-library",
    title: "Pattern library",
    content: (
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
    ),
  },
  {
    id: "selection-rationale",
    title: "Selection rationale",
    content: (
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
    ),
  },
  {
    id: "verification-trail",
    title: "Verification trail",
    content: (
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
        ]}
      />
    ),
  },
  {
    id: "flow-context",
    title: "Flow context",
    content: (
      <BreadcrumbContext01
        items={[
          { id: "overview", label: "Overview", onSelect: () => {} },
          { id: "patterns", label: "Patterns", onSelect: () => {} },
        ]}
        currentLabel="Pattern detail"
      />
    ),
  },
]

export function OrientationLanding() {
  const screen = studioContent.screens.orientation

  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <style>{`
        html, body {
          scrollbar-width: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <main className="relative flex flex-1 flex-col">
        <section className="flex flex-col items-center px-4 pt-12 pb-4 text-center md:pt-16 md:pb-6">
          <Badge variant="outline" className="gap-1 rounded-full px-3 py-1">
            AI Design System Studio
          </Badge>

          <style>{`
            @keyframes orientation-title-emerge {
              from { opacity: 0; filter: blur(8px); transform: scale(0.96); }
              to { opacity: 1; filter: blur(0); transform: scale(1); }
            }
            @keyframes orientation-cta-orbit-pulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.06); }
            }
          `}</style>

          <h1 className="mt-8 max-w-full text-2xl font-bold tracking-tighter whitespace-nowrap text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
            <span
              className="inline-block animate-[orientation-title-emerge_1s_ease-out] motion-reduce:animate-none"
              style={{ animationFillMode: "backwards" }}
            >
              {ORIENTATION_TITLE_ACCENT_CHARS.join("")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground text-balance md:text-lg md:leading-8">
            {screen.intro}
          </p>

          <div className="relative mt-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-11 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full animate-[orientation-cta-orbit-pulse_3s_ease-in-out_infinite] motion-reduce:animate-none"
              style={{
                boxShadow:
                  "0 0 0 1px color-mix(in oklch, var(--primary) 35%, transparent), 0 0 0 14px color-mix(in oklch, var(--primary) 10%, transparent), 0 0 0 28px color-mix(in oklch, var(--primary) 4%, transparent)",
              }}
            />
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
          className="relative w-full overflow-hidden px-4 pb-12 md:px-6 md:pb-16"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-24 z-10 h-24 bg-gradient-to-b from-transparent to-background" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background to-transparent" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 text-muted-foreground/40"
            style={{
              backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <style>{`
            @keyframes orientation-ring-spin {
              from { transform: rotateY(0deg); }
              to { transform: rotateY(360deg); }
            }
          `}</style>

          <div
            className="pointer-events-none relative mx-auto h-[480px] max-w-4xl select-none sm:h-[560px] md:h-[620px]"
            style={{ perspective: "1400px" }}
          >
            <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(closest-side,black,transparent)]" />

            <div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", transform: "rotateX(10deg)" }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="h-40 w-40 animate-[spin_140s_linear_infinite] text-primary opacity-80 motion-reduce:animate-none sm:h-48 sm:w-48 md:h-56 md:w-56"
                >
                  <circle cx="100" cy="100" r="90" />
                  <ellipse cx="100" cy="100" rx="90" ry="55" />
                  <ellipse cx="100" cy="100" rx="90" ry="20" />
                  <ellipse cx="100" cy="100" rx="55" ry="90" />
                  <ellipse cx="100" cy="100" rx="20" ry="90" />
                  <line x1="10" y1="100" x2="190" y2="100" />
                </svg>
              </div>

              <div
                className="absolute inset-0 animate-[orientation-ring-spin_90s_linear_infinite] motion-reduce:animate-none"
                style={{ transformStyle: "preserve-3d" }}
              >
                {orbitItems.map((item, index) => {
                  const angle = (360 / orbitItems.length) * index
                  return (
                    <div
                      key={item.id}
                      className="absolute top-1/2 left-1/2 w-48 sm:w-56"
                      style={{
                        transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(clamp(150px, 32vw, 260px))`,
                      }}
                    >
                      <ShowcaseBlock title={item.title}>
                        {item.content}
                      </ShowcaseBlock>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
