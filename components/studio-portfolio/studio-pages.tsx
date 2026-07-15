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
import ReactMarkdown from "react-markdown"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CodeIcon,
  ExternalLinkIcon,
  LayoutGridIcon,
  MessageCircleIcon,
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
import { Separator } from "@/components/ui/separator"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { builtExampleApps } from "@/lib/studio-portfolio/app-spec"
import { OrientationLanding } from "@/components/studio-portfolio/orientation-landing"
import studioPortfolioData from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { studioContent } from "@/lib/studio-portfolio/studio-content"
import { studioEvidence } from "@/lib/studio-portfolio/evidence"
import { studioScenarios } from "@/lib/studio-portfolio/studio-scenarios"

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

function useStudioBasePath() {
  const [basePath, setBasePath] = useState<string | null>(null)
  useEffect(() => {
    setBasePath(window.location.pathname.replace(/\/overview\/?$/, ""))
  }, [])
  return basePath
}

function SectionHeader({
  id,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  id: string
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-base font-medium">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={actionHref} data-open-window />}
        >
          {actionLabel} <ArrowRightIcon />
        </Button>
      ) : null}
    </div>
  )
}

// カードは w-72 (288px)。iframe をデスクトップ幅でレンダリングして全体像を見せ、
// カード幅に合わせて縮小する。値が小さいほど拡大表示(縦に短いアプリ向け)。
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
      <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        <div className="flex w-max animate-[example-apps-marquee_50s_linear_infinite] group-hover:[animation-play-state:paused]">
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
  return <OrientationLanding />
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
  const [selectedInventoryId, setSelectedInventoryId] =
    useState("registry-items")

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
          <PricingPlanCard
            selectedPlanId=""
            onSelectPlan={setSelectedInventoryId}
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
            <Button nativeButton={false} render={<Link href="/studio/result" />}>
              承認して結果を見る <ArrowRightIcon />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFrame>
  )
}

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
        <h2 id="trace-heading" className="mb-3 text-base font-medium">
          判断の記録を辿る
        </h2>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:w-48 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {studioSteps.map((step, index) => {
              const isSelected = step.id === selectedStepId
              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${isSelected ? "border-primary bg-primary/8" : "bg-card hover:bg-muted/50"}`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="min-w-0 flex-1">
            {selectedStepId === "brief" ? (
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
            ) : selectedStepId === "flow-spec" ? (
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
            ) : selectedStepId === "selection-spec" ? (
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
            ) : selectedStepId === "build-report" ? (
              <DetailOverview
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
              <Card>
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
function QualityFieldsCard({
  title,
  status,
  fields,
}: {
  title: string
  status: string
  fields: { id: string; label: string; value: string }[]
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="secondary">{status}</Badge>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.id} className="flex items-baseline gap-4 text-sm">
            <span className="w-32 shrink-0 text-muted-foreground">
              {field.label}
            </span>
            <span className="min-w-0 break-all">{field.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function QualityPage() {
  return (
    <PageFrame
      title="Quality"
      description="品質の主張を、契約・生成物・来歴まで遡って確認します。"
    >
      <div className="max-w-3xl space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          brief から画面ができるまでの各段階(FlowSpec → SelectionSpec →
          BuildReport)は、それぞれ「契約」として内容が固定されています。契約は
          JSON Schemaで書かれ、ajvという検証ツールが次の段階へ進む前に機械的に形式を確認するため、ルールから外れた内容が途中で紛れ込むことはありません。
        </p>
        <p>
          さらに生成物には provenance
          sidecarという記録が添えられます。これは入力ファイルの digest(内容から計算した指紋のようなもの)を保存する仕組みで、後から入力が書き換えられていないかを機械的に照合できます。「この画面はこのbriefと選定結果から作られた」という対応関係を、見た目ではなく検証可能な形で示します。
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Coverage matrix</CardTitle>
            <CardDescription>
              ScreenType・blockRoleの在庫が網羅されているかを確認します。
            </CardDescription>
          </div>
          <div className="max-w-xl space-y-2">
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
            <TabsTrigger value="provenance-trail">
              Provenance trail
            </TabsTrigger>
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
                <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-xs dark:bg-card">
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
          <Button nativeButton={false} render={<Link href="/studio/preview" />}>
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
          <Button nativeButton={false} render={<Link href="/patterns" />}>
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
          <Button variant="outline" nativeButton={false} render={<Link href="/patterns" />}>
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

export function CaseStudyPage({ markdown }: { markdown: string }) {
  return (
    <PageFrame
      title="Case Study"
      description="今回の開発の過程や学んだことのまとめ。"
    >
      <div
        className="max-w-3xl space-y-5 text-[0.9375rem] leading-8 text-foreground
          [counter-reset:cs-section]
          [&_code]:rounded [&_code]:border [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs
          [&_h1]:mt-14 first:[&_h1]:mt-0 [&_h1]:flex [&_h1]:items-baseline [&_h1]:gap-3 [&_h1]:border-b [&_h1]:pb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight
          [&_h1]:[counter-increment:cs-section]
          [&_h1]:before:content-[counter(cs-section,decimal-leading-zero)]
          [&_h1]:before:font-mono [&_h1]:before:text-sm [&_h1]:before:font-normal [&_h1]:before:text-primary
          [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold
          [&_li]:relative [&_li]:pl-5
          [&_li]:before:absolute [&_li]:before:top-[0.8em] [&_li]:before:left-0 [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-primary/60 [&_li]:before:content-['']
          [&_ol]:space-y-2 [&_ul]:space-y-2
          [&_ul]:rounded-lg [&_ul]:border [&_ul]:bg-muted/20 dark:[&_ul]:bg-card [&_ul]:p-4 [&_ul]:pl-5
          [&_strong]:font-semibold [&_strong]:text-primary
          [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/40 dark:[&_pre]:bg-card [&_pre]:p-4"
      >
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </PageFrame>
  )
}
