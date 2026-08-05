"use client"

// Route: /patterns. The largest of the studioApp pages; it carries the whole
// pattern catalogue and the ?category=/?state= URL state.

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { useTheme } from "next-themes"
import { ExternalLinkIcon } from "lucide-react"
import { DetailOverview } from "@/components/blocks/detail-overview-01"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { Badge } from "@react-shadcn/shadcn-kit/ui/badge"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@react-shadcn/shadcn-kit/ui/drawer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@react-shadcn/shadcn-kit/ui/table"
import data from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { PageFrame } from "./studio-page-shell"

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
            <div className="min-h-0 scrollbar-gutter-stable overflow-y-auto px-4 py-4">
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
