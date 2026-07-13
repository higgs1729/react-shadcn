"use client"

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { ActivityFeed } from "@/components/activity-feed-01"
import { ActionFooter } from "@/components/action-footer-01"
import { AiExplainabilityLabel } from "@/components/ai-explainability-label-01"
import { AiPromptComposer } from "@/components/ai-prompt-composer-01"
import { BreadcrumbContext01 } from "@/components/breadcrumb-context-01"
import { CollectionGrid } from "@/components/collection-grid-01"
import { CommentThread } from "@/components/comment-thread-01"
import { DetailOverview } from "@/components/detail-overview-01"
import { DocumentBodyEditor } from "@/components/document-body-editor-01"
import {
  FileUploadArea,
  type FileUploadAreaFile,
} from "@/components/file-upload-area-01"
import { FilterToolbar } from "@/components/filter-toolbar"
import { PricingPlanCard } from "@/components/pricing-plan-card-01"
import { SectionCards } from "@/components/section-cards"
import { WizardStepper } from "@/components/wizard-stepper-01"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import studioPortfolioData from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { studioContent } from "@/lib/studio-portfolio/studio-content"
import { studioEvidence } from "@/lib/studio-portfolio/evidence"
import { studioScenarios } from "@/lib/studio-portfolio/studio-scenarios"
import flowSpec from "@/docs/examples/flowspec-dryrun-saas-ops-01.json"
import selectionSpec from "@/docs/examples/selectionspec-dryrun-saas-ops-01.json"
import buildReport from "@/docs/examples/buildreport-dryrun-saas-ops-01.json"

const data = studioPortfolioData

function PageFrame({
  title,
  description,
  context,
  children,
}: {
  title: string
  description: string
  context?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {context ? <div className="mt-3">{context}</div> : null}
      </div>
      {children}
    </div>
  )
}

type VerificationState = "default" | "loading" | "empty" | "error"

type PatternCategory = {
  id: string
  label: string
  patternNames: string[]
}

const patternCategories: PatternCategory[] = [
  {
    id: "start-complete",
    label: "はじめる・完了する",
    patternNames: [
      "login-03",
      "onboarding-01",
      "workflow-01",
      "form-section-login-01",
      "wizard-stepper-01",
      "pricing-plan-card-01",
      "checkout-summary-01",
      "action-footer-01",
    ],
  },
  {
    id: "explore-understand",
    label: "探す・把握する",
    patternNames: [
      "collection-table-01",
      "dashboard-01",
      "detail-01",
      "report-analytics-01",
      "collection-grid-01",
      "command-search-01",
      "chart-panel-01",
      "data-table-panel-01",
      "detail-overview-01",
      "filter-toolbar-01",
      "summary-metric-row-01",
      "tabs-view-switcher-01",
    ],
  },
  {
    id: "create-configure",
    label: "作成・設定する",
    patternNames: [
      "create-edit-01",
      "document-workspace-01",
      "settings-admin-01",
      "document-body-editor-01",
      "file-upload-area-01",
      "settings-section-01",
    ],
  },
  {
    id: "collaborate-plan",
    label: "相談・計画する",
    patternNames: [
      "conversation-assistant-01",
      "inbox-communication-01",
      "planning-board-01",
      "activity-feed-01",
      "ai-conversation-list-01",
      "ai-prompt-composer-01",
      "board-column-01",
      "comment-thread-01",
      "conversation-triage-list-01",
      "notification-center-01",
    ],
  },
  {
    id: "navigate-context",
    label: "移動・文脈を保つ",
    patternNames: [
      "app-shell-topnav-01",
      "breadcrumb-context-01",
      "drawer-inspector-01",
      "modal-dialog-01",
      "page-header-actions-01",
      "sidebar-07",
    ],
  },
  {
    id: "system-feedback",
    label: "状態を伝える",
    patternNames: [
      "ai-explainability-label-01",
      "empty-state-01",
      "error-recovery-01",
      "loading-skeleton-01",
    ],
  },
]

function usePortfolioUrlState() {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const sync = () => setQuery(window.location.search)
    sync()
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  const params = useMemo(() => new URLSearchParams(query), [query])
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    const search = next.toString()
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`
    )
    setQuery(search ? `?${search}` : "")
  }

  return { params, update }
}

export function OrientationPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-8 p-6 md:p-10">
      <Badge variant="outline" className="w-fit">
        AI Design System Studio
      </Badge>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          UIを選んだ理由まで、追跡可能にする。
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          briefからFlowSpec、選定、実装、検証までを、静的な作品としてたどるためのStudioです。
        </p>
      </div>
      <WizardStepper
        steps={[
          { id: "brief", label: "Brief" },
          { id: "selection", label: "Selection" },
          { id: "evidence", label: "Evidence" },
        ]}
        currentStepId="brief"
        completedStepIds={[]}
      />
      <div className="flex flex-wrap gap-3">
        <Button size="lg" render={<Link href="/overview" />}>
          作品を見る <ArrowRightIcon />
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/studio" />}>
          Studioから始める
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        自動検証済みの証拠と、人間レビューが必要な判断を区別して表示します。
      </p>
    </div>
  )
}

type SystemFlowStageId =
  | "brief"
  | "flow-spec"
  | "selection-spec"
  | "build-report"
  | "ui"

const systemFlowStages: {
  id: SystemFlowStageId
  label: string
  fileName: string
}[] = [
  { id: "brief", label: "Brief", fileName: "brief" },
  { id: "flow-spec", label: "FlowSpec", fileName: "flowspec-dryrun-saas-ops-01.json" },
  { id: "selection-spec", label: "SelectionSpec", fileName: "selectionspec-dryrun-saas-ops-01.json" },
  { id: "build-report", label: "BuildReport", fileName: "buildreport-dryrun-saas-ops-01.json" },
  { id: "ui", label: "UI", fileName: "login-03" },
]

function SystemFlow() {
  const [selectedStageId, setSelectedStageId] = useState<SystemFlowStageId>("brief")
  const [loginPreviewSrc, setLoginPreviewSrc] = useState("")
  const selectedStage = systemFlowStages.find((stage) => stage.id === selectedStageId)!
  const scenario = studioScenarios.find((item) => item.id === "sign-in")!
  const flowStep = flowSpec.steps.find((step) => step.stepId === "login")!
  const selectedScreen = selectionSpec.screens.find((screen) => screen.stepId === "login")!
  const builtScreen = buildReport.screens.find((screen) => screen.stepId === "login")!

  useEffect(() => {
    const basePath = window.location.pathname.replace(/\/overview\/?$/, "")
    setLoginPreviewSrc(`${basePath}/flows/dryrun-saas-ops-01/login`)
  }, [])

  const preview =
    selectedStageId === "brief"
      ? JSON.stringify({ brief: scenario.brief }, null, 2)
      : selectedStageId === "flow-spec"
        ? JSON.stringify({ flowId: flowSpec.flowId, step: flowStep }, null, 2)
        : selectedStageId === "selection-spec"
          ? JSON.stringify({ flowId: selectionSpec.flowId, screen: selectedScreen }, null, 2)
          : selectedStageId === "build-report"
            ? JSON.stringify({ flowId: buildReport.flowId, screen: builtScreen, status: buildReport.status, checks: buildReport.checks }, null, 2)
            : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>システムの流れ</CardTitle>
        <CardDescription>
          briefから実装まで、選定と検証の根拠を実際の成果物でたどれます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-5">
          {systemFlowStages.map((stage, index) => {
            const isSelected = stage.id === selectedStageId
            return (
              <div key={stage.id} className="relative isolate min-w-0">
                {index < systemFlowStages.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 left-full z-0 hidden h-px w-2 bg-border sm:block"
                  />
                ) : null}
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`relative z-10 flex h-full min-h-32 w-full flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/8" : "bg-card hover:bg-muted/50"}`}
                >
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{stage.label}</span>
                  <span className="min-h-8 break-all font-mono text-[10px] leading-4 text-muted-foreground">{stage.fileName}</span>
                </button>
              </div>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-lg border bg-muted/20">
          <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">{selectedStage.fileName}</span>
            <Badge variant="outline">{selectedStage.label}</Badge>
          </div>
          {preview ? (
            <pre className="max-h-72 min-w-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-5 text-foreground">{preview}</pre>
          ) : (
            <div className="p-4 sm:p-5">
              {loginPreviewSrc ? (
                <div className="relative mx-auto aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-md border bg-background shadow-sm">
                  <iframe
                    title="Login 03"
                    src={loginPreviewSrc}
                    className="absolute top-0 left-0 h-[110%] w-[110%] origin-top-left scale-[0.91] border-0 bg-background"
                  />
                </div>
              ) : (
                <div className="mx-auto aspect-[4/3] w-full max-w-4xl animate-pulse rounded-md border bg-muted/30" />
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button render={<Link href="/studio" data-open-window />}>
          Studioで試す <ArrowRightIcon />
        </Button>
        <Button variant="outline" render={<Link href="/case-study" data-open-window />}>
          設計判断を読む
        </Button>
      </CardFooter>
    </Card>
  )
}

export function OverviewPage() {
  const [selectedId, setSelectedId] = useState("patterns")
  const [selectedInventoryId, setSelectedInventoryId] =
    useState("registry-items")

  return (
    <PageFrame
      title="AI Design System Studio"
      description={studioContent.message}
    >
      <SystemFlow />
      <Card className="hidden">
        <CardHeader>
          <CardTitle>briefから、説明できるUIの判断へ</CardTitle>
          <CardDescription>
            この作品では、要求をFlowSpec・SelectionSpec・BuildReportへつなぎ、なぜそのUIを選んだかを辿れる状態にします。
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button render={<Link href="/studio" data-open-window />}>
            briefから試す <ArrowRightIcon />
          </Button>
          <Button
            variant="outline"
            render={<Link href="/case-study" data-open-window />}
          >
            設計判断を読む
          </Button>
        </CardFooter>
      </Card>
      <section aria-labelledby="patterns-inventory-heading">
        <div className="mb-3">
          <h2 id="patterns-inventory-heading" className="text-base font-medium">
            Patterns inventory
          </h2>
        </div>
        <PricingPlanCard
          selectedPlanId={selectedInventoryId}
          onSelectPlan={setSelectedInventoryId}
          showAction={false}
          emphasizeAll
          plans={[
            {
              id: "screen-types",
              name: "ScreenTypes",
              price: String(data.inventory.screenTypes),
              period: "types",
              features: [],
              preview: (
                <div className="h-28 overflow-hidden rounded-md border bg-muted/20 p-2">
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
                <div className="grid h-28 grid-cols-3 gap-2 rounded-md border bg-muted/20 p-2">
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
                <div className="h-28 overflow-hidden rounded-md border bg-muted/20 p-2">
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
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/patterns" data-open-window />}
          >
            実際に確認する <ArrowRightIcon />
          </Button>
        </div>
      </section>

      <Card className="hidden">
        <CardHeader>
          <CardTitle>設計から検証まで</CardTitle>
          <CardDescription>
            意図を実装へ渡すために、判断を4つの契約で固定します。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {["Brief", "FlowSpec", "SelectionSpec", "BuildReport", "UI"].map(
            (step, index) => (
              <div
                key={step}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs">
                  {index + 1}
                </span>
                {step}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <div className="hidden">
        <h2 className="mb-3 text-base font-medium">次に確認する場所</h2>
        <CollectionGrid
          selectedId={selectedId}
          onItemSelect={setSelectedId}
          items={[
            {
              id: "patterns",
              title: "Patterns",
              description: "在庫、状態、maturityを探索する",
              badge: "Browse",
            },
            {
              id: "studio",
              title: "Studio",
              description: "briefから選定結果までを体験する",
              badge: "Compose",
            },
            {
              id: "quality",
              title: "Quality",
              description: "検証の根拠と未実施事項を確認する",
              badge: "Verify",
            },
          ]}
        />
        <div className="mt-3">
          <Button
            variant="outline"
            render={<Link href={`/${selectedId}`} data-open-window />}
          >
            選択したPageを開く <ArrowRightIcon />
          </Button>
        </div>
      </div>

      <Card className="hidden">
        <CardHeader>
          <CardTitle>作品の到達点</CardTitle>
          <CardDescription>
            設計・実装・検証を、公開可能な静的artifactへ順に接続しています。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            entries={[
              {
                id: "spec",
                actor: "Spec",
                action: "画面階層とcontent-fitの判断を固定",
                timestamp: "Architecture",
              },
              {
                id: "routes",
                actor: "Routes",
                action: "共有StudioLayout内の5 Pageへ移行",
                timestamp: "Implementation",
              },
              {
                id: "checks",
                actor: "Checks",
                action: "contracts・typecheck・build・Storybookを検証",
                timestamp: "Verification",
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="hidden">
        <CardHeader>
          <CardTitle>公開上の境界</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          inventoryはexperimentalを含みます。自動検証のpassは、UX・内容・maturityに対する人間レビューを代替しません。
        </CardContent>
      </Card>
    </PageFrame>
  )
}

export function PatternsPage() {
  const { resolvedTheme } = useTheme()
  const { params, update: updateUrlState } = usePortfolioUrlState()
  const [search, setSearch] = useState("")
  const [kind, setKind] = useState("all")
  const [view, setView] = useState<"table" | "grid">("grid")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )
  const [selectedPatternName, setSelectedPatternName] = useState<string | null>(
    null
  )
  const [detailOpen, setDetailOpen] = useState(false)
  const [liveDemoOpen, setLiveDemoOpen] = useState(false)
  const [liveDemoSrc, setLiveDemoSrc] = useState("")
  const selectedCategory =
    patternCategories.find((category) => category.id === selectedCategoryId) ??
    null
  const patterns = useMemo(
    () =>
      [
        ...data.inventory.screenPatterns,
        ...data.inventory.blockPatterns,
      ].filter((pattern) => {
        const matchesKind = kind === "all" || pattern.assetKind === kind
        const needle = search.trim().toLowerCase()
        const matchesSearch =
          !needle ||
          [
            pattern.name,
            pattern.title,
            pattern.description,
            pattern.screenType,
            pattern.blockRole,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(needle)
        const matchesCategory =
          !selectedCategory ||
          selectedCategory.patternNames.includes(pattern.name)
        return matchesKind && matchesSearch && matchesCategory
      }),
    [kind, search, selectedCategory]
  )
  const selectedPattern =
    [...data.inventory.screenPatterns, ...data.inventory.blockPatterns].find(
      (pattern) => pattern.name === selectedPatternName
    ) ?? null
  const storyId = selectedPattern?.storybookStories[0]
  const verificationState = "default" as VerificationState

  useEffect(() => {
    if (!storyId) {
      setLiveDemoSrc("")
      return
    }

    const storybookBase =
      process.env.NODE_ENV === "development"
        ? "http://localhost:6006"
        : `${window.location.pathname.replace(/\/patterns\/?$/, "")}/storybook`
    const storybookTheme = resolvedTheme === "dark" ? "dark" : "light"
    setLiveDemoSrc(
      `${storybookBase}/iframe.html?id=${storyId}&viewMode=story&globals=theme:${storybookTheme}`
    )
  }, [resolvedTheme, storyId])

  useEffect(() => {
    const panel = params.get("panel")
    const pattern = params.get("pattern")
    if (pattern) setSelectedPatternName(pattern)
    setDetailOpen(panel === "pattern-detail")
    setLiveDemoOpen(panel === "live-demo")
  }, [params])

  function showDetail(name: string) {
    setSelectedPatternName(name)
    setDetailOpen(true)
    updateUrlState({ panel: "pattern-detail", pattern: name })
  }

  function showLiveDemo(name: string) {
    setSelectedPatternName(name)
    setLiveDemoOpen(true)
    updateUrlState({ panel: "live-demo", pattern: name })
  }

  return (
    <PageFrame
      title="Patterns"
      description="役割・状態・maturityを手がかりに、再利用可能なscreenとblockの在庫を確認します。"
    >
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        status={kind}
        onStatusChange={setKind}
        statusOptions={[
          { value: "all", label: "All patterns" },
          { value: "screen-pattern", label: "Screens" },
          { value: "block-pattern", label: "Blocks" },
        ]}
        view={view}
        onViewChange={setView}
      />
      <div
        className="flex flex-wrap items-center gap-2"
        aria-label="Pattern candidates"
      >
        <span className="text-xs text-muted-foreground">目的から探す:</span>
        {patternCategories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategoryId === category.id ? "secondary" : "ghost"}
            onClick={() =>
              setSelectedCategoryId((current) =>
                current === category.id ? null : category.id
              )
            }
          >
            {category.label} ({category.patternNames.length})
          </Button>
        ))}
      </div>
      {verificationState === "loading" ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Loading patterns"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index} className="h-44 animate-pulse">
              <CardContent className="h-full p-5">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="mt-4 h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-4/5 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : verificationState === "error" ? (
        <Card>
          <CardHeader>
            <CardTitle>Patterns could not be loaded</CardTitle>
            <CardDescription>
              This is a URL-addressable verification state; the static portfolio
              has no runtime data request.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => updateUrlState({ state: null })}
            >
              Return to default
            </Button>
          </CardFooter>
        </Card>
      ) : verificationState === "empty" ? (
        <Card>
          <CardHeader>
            <CardTitle>No patterns match this view</CardTitle>
            <CardDescription>
              This is a URL-addressable verification state for the empty
              inventory result.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => updateUrlState({ state: null })}
            >
              Return to default
            </Button>
          </CardFooter>
        </Card>
      ) : view === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead>States</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patterns.map((pattern) => (
                  <TableRow key={pattern.name}>
                    <TableCell>
                      <div className="font-medium">{pattern.title}</div>
                      <div className="max-w-lg text-xs whitespace-normal text-muted-foreground">
                        {pattern.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pattern.assetKind === "screen-pattern"
                          ? "Screen"
                          : "Block"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pattern.screenType ?? pattern.blockRole ?? "—"}
                    </TableCell>
                    <TableCell>{pattern.maturity}</TableCell>
                    <TableCell>
                      {pattern.stateCoverage.join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => showDetail(pattern.name)}
                        >
                          Detail
                        </Button>
                        {pattern.storybookStories.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showLiveDemo(pattern.name)}
                          >
                            Live demo
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {patterns.map((pattern) => (
            <Card key={pattern.name}>
              <CardHeader>
                <CardTitle>{pattern.title}</CardTitle>
                <CardDescription>{pattern.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">{pattern.assetKind}</Badge>
                <Badge variant="secondary">{pattern.maturity}</Badge>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showDetail(pattern.name)}
                >
                  Detail
                </Button>
                {pattern.storybookStories.length > 0 && (
                  <Button size="sm" onClick={() => showLiveDemo(pattern.name)}>
                    Live demo
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {patterns.length}件表示。Detailはmetadataを、Live
        demoは同じ公開artifact内のStorybookを開きます。
      </p>

      <Drawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open && params.get("panel") === "pattern-detail")
            updateUrlState({ panel: null, pattern: null })
        }}
        swipeDirection="right"
      >
        <DrawerContent className="max-w-xl">
          <DrawerHeader>
            <DrawerTitle>
              {selectedPattern?.title ?? "Pattern detail"}
            </DrawerTitle>
            <DrawerDescription>
              {selectedPattern?.description}
            </DrawerDescription>
          </DrawerHeader>
          {selectedPattern && (
            <div className="min-h-0 overflow-y-auto px-4 py-4">
              <DetailOverview
                title={selectedPattern.name}
                status={selectedPattern.maturity}
                fields={[
                  {
                    id: "kind",
                    label: "Asset kind",
                    value: selectedPattern.assetKind,
                  },
                  {
                    id: "role",
                    label: "Role",
                    value:
                      selectedPattern.screenType ??
                      selectedPattern.blockRole ??
                      "—",
                  },
                  {
                    id: "states",
                    label: "States",
                    value: selectedPattern.stateCoverage.join(", ") || "—",
                  },
                  {
                    id: "story",
                    label: "Storybook",
                    value: selectedPattern.storybookStories.length
                      ? "Available"
                      : "Not generated",
                  },
                ]}
              />
            </div>
          )}
          <DrawerFooter>
            {selectedPattern && storyId && (
              <Button
                onClick={() => {
                  setDetailOpen(false)
                  setLiveDemoOpen(true)
                  updateUrlState({
                    panel: "live-demo",
                    pattern: selectedPattern.name,
                  })
                }}
              >
                Open live demo <ExternalLinkIcon />
              </Button>
            )}
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={liveDemoOpen}
        onOpenChange={(open) => {
          setLiveDemoOpen(open)
          if (!open && params.get("panel") === "live-demo")
            updateUrlState({ panel: null, pattern: null })
        }}
        swipeDirection="right"
      >
        <DrawerContent
          style={
            {
              "--drawer-content-width": "min(calc(100dvw - 1rem), 80rem)",
            } as CSSProperties
          }
        >
          <DrawerHeader>
            <DrawerTitle>{selectedPattern?.title ?? "Live demo"}</DrawerTitle>
            <DrawerDescription>
              Storybookで生成された実装状態を表示します。
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 p-4">
            {liveDemoSrc ? (
              <iframe
                title={`${selectedPattern?.title} live demo`}
                src={liveDemoSrc}
                className="h-[calc(100dvh-11rem)] w-full rounded-md border bg-background md:min-h-[36rem]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                このpatternにはStorybook previewがありません。
              </p>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PageFrame>
  )
}

export function LegacyStudioWorkspace() {
  const { params, update: updateUrlState } = usePortfolioUrlState()
  const [title, setTitle] = useState("Studio Portfolio: static delivery brief")
  const [content, setContent] = useState(
    "Goal: show how a brief becomes evidence-backed UI selection.\nAudience: reviewers evaluating design-system reasoning.\nConstraints: static export, two-day delivery, no backend."
  )
  const [reply, setReply] = useState("")
  const [comments, setComments] = useState([
    {
      id: "review",
      author: "Reviewer",
      body: "Show the selection rationale and the boundary of automated verification.",
      timestamp: "Design review",
    },
  ])
  const [files, setFiles] = useState<FileUploadAreaFile[]>([])
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [rationaleOpen, setRationaleOpen] = useState(false)
  const [checkpointOpen, setCheckpointOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [assistantSuggestion, setAssistantSuggestion] = useState(
    "明示するとよい不足条件: 成功条件、優先する閲覧導線、静的公開で扱わない操作の境界。"
  )
  useEffect(() => {
    const panel = params.get("panel")
    setAssistantOpen(panel === "ai-assistant")
    setRationaleOpen(panel === "selection-rationale")
    setCheckpointOpen(panel === "flow-checkpoint")
  }, [params])

  function openPanel(
    panel: "ai-assistant" | "selection-rationale" | "flow-checkpoint"
  ) {
    updateUrlState({ panel })
  }

  const studioSteps = studioEvidence.selections
  const briefRisk =
    studioEvidence.selections.find(
      (selection) => selection.stepId === "studio-composer"
    )?.risks[0] ?? "静的公開のため、AI APIや永続化は扱いません。"

  function addFiles(fileList: FileList) {
    setFiles((current) => [
      ...current,
      ...Array.from(fileList).map((file) => ({
        id: `${file.name}-${file.size}`,
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        state: "done" as const,
      })),
    ])
  }

  function applyAssistantSuggestion() {
    setContent(
      (current) => `${current}\n\nAI suggestion: ${assistantSuggestion}`
    )
    setAssistantOpen(false)
  }

  return (
    <PageFrame
      title="Studio"
      description="サンプルbriefを起点に、FlowSpec・選定結果・実装証拠を一つの作業面で確認します。"
    >
      <BreadcrumbContext01
        items={[{ id: "portfolio", label: "Portfolio", onSelect: () => {} }]}
        currentLabel="Studio brief"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setAssistantOpen(true)}>
          AIに不足条件を確認する
        </Button>
        <Button variant="outline" onClick={() => setRationaleOpen(true)}>
          選定理由を見る
        </Button>
        <Button variant="outline" onClick={() => setCheckpointOpen(true)}>
          承認前の確認
        </Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <DocumentBodyEditor
            title={title}
            onTitleChange={setTitle}
            content={content}
            onContentChange={setContent}
            savedState="saved"
            attachments={[
              {
                id: "flow",
                name: "flowspec-studio-portfolio-01.json",
                meta: "Build-time source",
              },
            ]}
          />
          <FileUploadArea
            files={files}
            onFilesSelected={addFiles}
            onDrop={(event) => addFiles(event.dataTransfer.files)}
            onRemoveFile={(id) =>
              setFiles((current) => current.filter((file) => file.id !== id))
            }
          />
        </div>
        <CommentThread
          comments={comments}
          replyValue={reply}
          onReplyChange={setReply}
          onSubmitReply={() => {
            if (!reply.trim()) return
            setComments((current) => [
              ...current,
              {
                id: `comment-${current.length + 1}`,
                author: "You",
                body: reply,
                timestamp: "Just now",
              },
            ])
            setReply("")
          }}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>選定済みの16 step</CardTitle>
          <CardDescription>
            Task
            20のSelectionSpecを履歴証拠として表示しています。新しいportfolio
            appの検証とは分離します。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {studioSteps.map((step) => (
            <div
              key={step.stepId}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{step.stepId}</p>
                <p className="text-xs text-muted-foreground">
                  {step.pattern} · {step.screenType}
                </p>
              </div>
              <Badge variant="secondary">{step.score}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <ActionFooter
        primaryLabel="選定結果を生成する"
        secondaryLabel="選定理由を見る"
        onPrimaryAction={() => setCheckpointOpen(true)}
        onSecondaryAction={() => setRationaleOpen(true)}
      />

      <Drawer
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        swipeDirection="right"
      >
        <DrawerContent className="max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>AI assistant</DrawerTitle>
            <DrawerDescription>
              不足条件を説明し、briefへ反映するための補助です。
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 overflow-y-auto px-4 py-4">
            <AiExplainabilityLabel
              confidence="medium"
              explanation="提案は静的なsample briefとSelectionSpecに基づきます。"
            />
            <Card>
              <CardHeader>
                <CardTitle>確認が必要な条件</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-4 text-sm">
                  <li>作品の成功条件を、閲覧者の行動として定義する。</li>
                  <li>PrimaryNavigationから優先して見せる導線を決める。</li>
                  <li>静的公開では扱わないAPI・保存・認可の境界を明示する。</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>提案</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {assistantSuggestion}
              </CardContent>
            </Card>
            <AiPromptComposer
              value={prompt}
              onValueChange={setPrompt}
              placeholder="追加で確認したい条件を入力"
              onSend={() => {
                if (!prompt.trim()) return
                setAssistantSuggestion(
                  `入力内容「${prompt}」をbriefの成功条件と制約へ反映することを提案します。`
                )
                setPrompt("")
              }}
            />
          </div>
          <DrawerFooter>
            <Button onClick={applyAssistantSuggestion}>briefへ反映</Button>
            <Button
              variant="outline"
              onClick={() => {
                setAssistantOpen(false)
                setCheckpointOpen(true)
              }}
            >
              承認前の確認へ
            </Button>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={rationaleOpen}
        onOpenChange={setRationaleOpen}
        swipeDirection="right"
      >
        <DrawerContent className="max-w-3xl">
          <DrawerHeader>
            <DrawerTitle>Selection rationale</DrawerTitle>
            <DrawerDescription>
              採用候補、score、前提、riskをSelectionSpecから表示します。
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 overflow-y-auto px-4 py-4">
            {studioEvidence.selections.map((selection) => (
              <Card key={selection.stepId} size="sm">
                <CardHeader>
                  <CardTitle>{selection.stepId}</CardTitle>
                  <CardDescription>
                    {selection.pattern} · score {selection.score}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Score内訳:</span> ScreenType{" "}
                    {selection.screenTypeScore} · Pattern {selection.score}
                    <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                      {selection.blockScores.map((block) => (
                        <li key={block.role}>
                          {block.role}: {block.registryItem} ({block.score})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <span className="font-medium">却下候補:</span>{" "}
                    {selection.rejected.length
                      ? selection.rejected
                          .map(
                            (candidate) =>
                              `${candidate.registryItem ?? candidate} (${candidate.score ?? "—"})`
                          )
                          .join(", ")
                      : "記録なし（単一候補で解決）"}
                  </p>
                  <p>
                    <span className="font-medium">Assumption:</span>{" "}
                    {selection.assumptions[0] ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Risk:</span>{" "}
                    {selection.risks[0] ?? "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Dialog open={checkpointOpen} onOpenChange={setCheckpointOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>このflowを進めますか？</DialogTitle>
            <DialogDescription>
              選定結果と前提を確認し、人間の承認として結果表示へ進みます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <DetailOverview
              title="Selection checkpoint"
              status={studioEvidence.build.status}
              fields={[
                {
                  id: "steps",
                  label: "Resolved steps",
                  value: String(studioEvidence.selections.length),
                },
                {
                  id: "patterns",
                  label: "Selected patterns",
                  value: String(
                    new Set(
                      studioEvidence.selections.map(
                        (selection) => selection.pattern
                      )
                    ).size
                  ),
                },
                { id: "risk", label: "Known risk", value: briefRisk },
              ]}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Back
            </DialogClose>
            <Button render={<Link href="/studio/result" />}>
              承認して結果を見る <ArrowRightIcon />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFrame>
  )
}

export function StudioPage() {
  const [selectedId, setSelectedId] = useState(studioScenarios[0].id)
  const selectedScenario =
    studioScenarios.find((scenario) => scenario.id === selectedId) ??
    studioScenarios[0]

  return (
    <PageFrame
      title="Studio"
      description="実行時にAIが生成する画面ではありません。実在するpatternへ結びつけた、選択式の静的サンプルで判断の流れを確認します。"
    >
      <Card>
        <CardHeader>
          <CardTitle>Briefから実装previewまでを、選んで辿る</CardTitle>
          <CardDescription>
            サンプルを選ぶと、その意図に対応する事前作成済みのFlowSpecとSelectionSpec、実在するStorybook
            previewを順に確認できます。
          </CardDescription>
        </CardHeader>
      </Card>

      <section aria-labelledby="scenario-heading">
        <h2 id="scenario-heading" className="mb-3 text-base font-medium">
          1. 確認したいことを選ぶ
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
        <h2 id="trace-heading" className="mb-3 text-base font-medium">
          2. 判断の記録を辿る
        </h2>
        <div className="grid gap-4 xl:grid-cols-3">
          <DetailOverview
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
          <DetailOverview
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
          <DetailOverview
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
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>3. 実装previewを確認する</CardTitle>
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

      <p className="text-xs text-muted-foreground">
        この画面は静的ポートフォリオです。入力から新しいFlowSpec・SelectionSpec・UIを生成したり、外部AIへ問い合わせたりはしません。
      </p>
    </PageFrame>
  )
}

export function QualityPage() {
  const { params } = usePortfolioUrlState()
  const verifiedFlows = data.flows.filter((flow) => flow.status === "verified")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [view, setView] = useState<"table" | "grid">("table")
  const [contractOpen, setContractOpen] = useState(false)
  const [provenanceOpen, setProvenanceOpen] = useState(false)
  const checks = studioEvidence.checks.filter(
    (check) =>
      (status === "all" || check.status === status) &&
      (!search.trim() ||
        `${check.name} ${check.command}`
          .toLowerCase()
          .includes(search.toLowerCase()))
  )

  useEffect(() => {
    const panel = params.get("panel")
    setContractOpen(panel === "contract-explorer")
    setProvenanceOpen(panel === "provenance-trail")
  }, [params])

  return (
    <PageFrame
      title="Quality"
      description="品質の主張を、契約・生成物・チェック結果まで遡って確認します。"
    >
      <Card>
        <CardHeader>
          <CardTitle>判断の根拠を、公開前に辿る</CardTitle>
          <CardDescription>
            まず契約・来歴・coverageを確認し、その後に個別の自動checkへ進みます。数値は検証範囲を示す補助情報です。
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button render={<Link href="/quality/coverage" />}>
            Coverage matrix
          </Button>
          <Button variant="outline" onClick={() => setContractOpen(true)}>
            Contract explorer
          </Button>
          <Button variant="outline" onClick={() => setProvenanceOpen(true)}>
            Provenance trail
          </Button>
        </CardFooter>
      </Card>
      <SectionCards
        variant="compact"
        items={[
          {
            label: "Verified flows",
            value: String(verifiedFlows.length),
            summary: "BuildReportでverified",
            detail: "Example flows",
          },
          {
            label: "Built screens",
            value: String(
              data.flows.reduce((total, flow) => total + flow.screens, 0)
            ),
            summary: "例示flowに含まれる画面",
            detail: "BuildReport screens",
          },
          {
            label: "Unresolved",
            value: String(
              data.flows.reduce((total, flow) => total + flow.unresolved, 0)
            ),
            summary: "例示flowの未解決数",
            detail: "Resolution status",
          },
          {
            label: "Registry coverage",
            value: `${data.inventory.screenTypes}/${data.inventory.screenTypes}`,
            summary: "ScreenType inventoryのcoverage",
            detail: "Coverage report",
          },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>自動検証</CardTitle>
          <CardDescription>
            Task
            20のBuildReportに記録された再現可能なcheckです。現在のportfolio本体は別途`npm
            run checks`で確認します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterToolbar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            statusOptions={[
              { value: "all", label: "All checks" },
              { value: "pass", label: "Pass" },
            ]}
            view={view}
            onViewChange={setView}
          />
          {view === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.name}>
                    <TableCell>{check.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {check.command}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          check.status === "pass" ? "secondary" : "outline"
                        }
                      >
                        {check.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {checks.map((check) => (
                <div key={check.name} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{check.name}</span>
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {check.command}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>人間レビューが必要な項目</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            "content fitと読みやすさ",
            "maturityの昇格判断",
            "公開前の最終UX確認",
          ].map((item) => (
            <div key={item} className="rounded-md border p-3 text-sm">
              <ShieldCheckIcon className="mb-2 size-4 text-muted-foreground" />
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
      <Drawer
        open={contractOpen}
        onOpenChange={setContractOpen}
        swipeDirection="right"
      >
        <DrawerContent className="max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Contract explorer</DrawerTitle>
            <DrawerDescription>
              実装へ渡す判断を固定する4つの契約です。
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 overflow-y-auto px-4 py-4">
            {studioEvidence.contracts.map((contract) => (
              <div key={contract.name} className="space-y-2">
                <DetailOverview
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
                <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-xs">
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
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={provenanceOpen}
        onOpenChange={setProvenanceOpen}
        swipeDirection="right"
      >
        <DrawerContent className="max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Provenance trail</DrawerTitle>
            <DrawerDescription>
              入力とregistry inventoryのdigestを、BuildReportと結びます。
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 overflow-y-auto px-4 py-4">
            <DetailOverview
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
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PageFrame>
  )
}

export function ResultReportPage() {
  return (
    <PageFrame
      title="Result report"
      description="承認したflowのSelectionSpecとBuildReportを、ChildRouteとして確認します。"
    >
      <SectionCards
        items={[
          {
            label: "Resolved steps",
            value: String(studioEvidence.selections.length),
            summary: "SelectionSpecの解決済みstep",
            detail: "studio-portfolio-01",
          },
          {
            label: "Built screens",
            value: String(studioEvidence.build.screens),
            summary: "BuildReportの作成画面",
            detail: "Historical evidence",
          },
          {
            label: "Unresolved",
            value: String(studioEvidence.build.unresolved),
            summary: "BuildReportの未解決数",
            detail: "Historical evidence",
          },
          {
            label: "Checks",
            value: String(studioEvidence.checks.length),
            summary: "記録された自動check",
            detail: "BuildReport",
          },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>採用されたpattern</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {studioEvidence.selections.map((selection) => (
            <div key={selection.stepId} className="rounded-md border p-3">
              <p className="font-medium">{selection.stepId}</p>
              <p className="text-sm text-muted-foreground">
                {selection.pattern}
              </p>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button render={<Link href="/studio/preview" />}>
            生成previewを見る <ArrowRightIcon />
          </Button>
        </CardFooter>
      </Card>
    </PageFrame>
  )
}

export function GeneratedPreviewPage() {
  const preview = studioEvidence.selections.find(
    (selection) => selection.stepId === "generated-preview"
  )
  return (
    <PageFrame
      title="Generated preview"
      description="選定結果を、実際のregistry patternとStorybook artifactへ接続するためのpreviewです。"
    >
      <DetailOverview
        title={preview?.pattern ?? "No preview"}
        status="Selected"
        fields={[
          {
            id: "type",
            label: "Screen type",
            value: preview?.screenType ?? "—",
          },
          {
            id: "score",
            label: "Selection score",
            value: String(preview?.score ?? "—"),
          },
          {
            id: "blocks",
            label: "Blocks",
            value: preview?.blocks.join(", ") ?? "—",
          },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>次の確認</CardTitle>
          <CardDescription>
            PatternsでdetailとLive
            demoを開き、default/loading/empty/errorのstoryを確認します。
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button render={<Link href="/patterns" />}>
            Patternsを開く <ExternalLinkIcon />
          </Button>
        </CardFooter>
      </Card>
    </PageFrame>
  )
}

export function CoverageMatrixPage() {
  const allPatterns = [
    ...data.inventory.screenPatterns,
    ...data.inventory.blockPatterns,
  ]
  return (
    <PageFrame
      title="Coverage matrix"
      description="ScreenTypeとblockRoleの在庫・maturity・状態を、registryのbuild-time dataから確認します。"
      context={
        <BreadcrumbContext01
          items={[
            {
              id: "quality",
              label: "Quality",
              onSelect: () => window.location.assign("/quality"),
            },
          ]}
          currentLabel="Coverage matrix"
        />
      }
    >
      <SectionCards
        items={[
          {
            label: "ScreenTypes",
            value: String(data.inventory.screenTypes),
            summary: "canonical vocabulary",
            detail: "Coverage 13/13",
          },
          {
            label: "blockRoles",
            value: String(data.inventory.blockRoles),
            summary: "canonical vocabulary",
            detail: "Coverage 33/33",
          },
          {
            label: "Patterns",
            value: String(allPatterns.length),
            summary: "registry items",
            detail: "Screen and block patterns",
          },
          {
            label: "Verified flows",
            value: String(
              data.flows.filter((flow) => flow.status === "verified").length
            ),
            summary: "example evidence",
            detail: "BuildReport",
          },
        ]}
        variant="compact"
      />
      <Card>
        <CardHeader>
          <CardTitle>在庫の網羅性を、採用前に確かめる</CardTitle>
          <CardDescription>
            Patternごとの役割・maturity・状態を一覧で照合します。数字は確認対象の規模、下の表が実際の判断材料です。
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" render={<Link href="/patterns" />}>
            Patternsを開く <ArrowRightIcon />
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead>States</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPatterns.map((pattern) => (
                <TableRow key={pattern.name}>
                  <TableCell>{pattern.name}</TableCell>
                  <TableCell>
                    {pattern.screenType ?? pattern.blockRole ?? "—"}
                  </TableCell>
                  <TableCell>{pattern.maturity}</TableCell>
                  <TableCell>
                    {pattern.stateCoverage.join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageFrame>
  )
}

export function CaseStudyPage() {
  return (
    <PageFrame
      title="Case Study"
      description="画面を単独のテンプレートではなく、Page・ChildRoute・Drawer・Dialogからなる階層として設計し直した過程をまとめます。"
    >
      <DetailOverview
        title="Studio Portfolio"
        status="In progress"
        fields={[
          {
            id: "problem",
            label: "Problem",
            value: "選定済みpatternと作品contentの不整合",
          },
          {
            id: "decision",
            label: "Decision",
            value: "content fitを優先してcompositionを分離",
          },
          {
            id: "delivery",
            label: "Delivery",
            value: "Static export / GitHub Pages",
          },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          [
            "Contract-first",
            "briefから実装までの判断をFlowSpec・SelectionSpec・BuildReportで受け渡す。",
          ],
          [
            "Inventory-first",
            "すべてのcomponentを使うのではなく、JTBDに必要な在庫だけを使う。",
          ],
          [
            "Hierarchy-first",
            "PrimaryNavigation、Page、ChildRoute、Drawer、Dialogの責務を混同しない。",
          ],
          [
            "Content fit",
            "無関係なKPIやchartを流用せず、適合しない場合は理由を残してcompositionを切り替える。",
          ],
          [
            "Result",
            "5つのPageと、選定結果・coverageを確認するChildRouteを静的export可能な構成で実装した。",
          ],
          [
            "Current limit",
            "AI API、永続化、maturity昇格、人間による最終UX評価は静的portfolioの対象外として明示する。",
          ],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>現在の到達点</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            entries={[
              {
                id: "spec",
                actor: "Spec",
                action: "StudioLayoutとroute hierarchyを定義",
                timestamp: "Design decision",
              },
              {
                id: "data",
                actor: "Data",
                action: "portfolio dataをroute外のbuild-time moduleへ退避",
                timestamp: "Implementation",
              },
              {
                id: "quality",
                actor: "Checks",
                action: "validate・typecheck・build・Storybookを確認",
                timestamp: "Verification",
              },
            ]}
          />
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            render={<Link href="/quality" data-open-window />}
          >
            検証結果を見る <ExternalLinkIcon />
          </Button>
        </CardFooter>
      </Card>
    </PageFrame>
  )
}
