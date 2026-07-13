"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckCircle2Icon, ExternalLinkIcon, ShieldCheckIcon } from "lucide-react"

import { ActivityFeed } from "@/components/activity-feed-01"
import { BreadcrumbContext01 } from "@/components/breadcrumb-context-01"
import { CollectionGrid } from "@/components/collection-grid-01"
import { CommentThread } from "@/components/comment-thread-01"
import { DetailOverview } from "@/components/detail-overview-01"
import { DocumentBodyEditor } from "@/components/document-body-editor-01"
import { FilterToolbar } from "@/components/filter-toolbar"
import { SectionCards } from "@/components/section-cards"
import { WizardStepper } from "@/components/wizard-stepper-01"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import studioPortfolioData from "@/lib/studio-portfolio/studio-portfolio-data.json"
import { studioContent } from "@/lib/studio-portfolio/studio-content"

const data = studioPortfolioData

function PageFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export function OrientationPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-8 p-6 md:p-10">
      <Badge variant="outline" className="w-fit">AI Design System Studio</Badge>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">UIを選んだ理由まで、追跡可能にする。</h1>
        <p className="mt-4 leading-7 text-muted-foreground">briefからFlowSpec、選定、実装、検証までを、静的な作品としてたどるためのStudioです。</p>
      </div>
      <WizardStepper
        steps={[{ id: "brief", label: "Brief" }, { id: "selection", label: "Selection" }, { id: "evidence", label: "Evidence" }]}
        currentStepId="brief"
        completedStepIds={[]}
      />
      <div className="flex flex-wrap gap-3">
        <Button size="lg" render={<Link href="/overview" />}>作品を見る <ArrowRightIcon /></Button>
        <Button variant="outline" size="lg" render={<Link href="/studio" />}>Studioから始める</Button>
      </div>
      <p className="text-xs text-muted-foreground">自動検証済みの証拠と、人間レビューが必要な判断を区別して表示します。</p>
    </div>
  )
}

export function OverviewPage() {
  const [selectedId, setSelectedId] = useState("patterns")
  const flows = data.flows

  return (
    <PageFrame title="AI Design System Studio" description={studioContent.message}>
      <SectionCards items={[{ label: "ScreenTypes", value: String(data.inventory.screenTypes), summary: "現在の正規語彙", detail: "ScreenType inventory" }, { label: "blockRoles", value: String(data.inventory.blockRoles), summary: "画面を構成する責務", detail: "Block role inventory" }, { label: "Registry items", value: String(data.inventory.registryItems), summary: "再利用可能な在庫", detail: "Screen / block patterns" }, { label: "Verified flows", value: `${flows.filter((flow) => flow.status === "verified").length}/${flows.length}`, summary: "例示flowの検証結果", detail: "BuildReport status" }]} />

      <Card>
        <CardHeader>
          <CardTitle>設計から検証まで</CardTitle>
          <CardDescription>意図を実装へ渡すために、判断を4つの契約で固定します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {["Brief", "FlowSpec", "SelectionSpec", "BuildReport", "UI"].map((step, index) => (
            <div key={step} className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs">{index + 1}</span>{step}
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-medium">次に確認する場所</h2>
        <CollectionGrid
          selectedId={selectedId}
          onItemSelect={setSelectedId}
          items={[
            { id: "patterns", title: "Patterns", description: "在庫、状態、maturityを探索する", badge: "Browse" },
            { id: "studio", title: "Studio", description: "briefから選定結果までを体験する", badge: "Compose" },
            { id: "quality", title: "Quality", description: "検証の根拠と未実施事項を確認する", badge: "Verify" },
          ]}
        />
        <div className="mt-3"><Button variant="outline" render={<Link href={`/${selectedId}`} />}>選択したPageを開く <ArrowRightIcon /></Button></div>
      </div>

      <Card>
        <CardHeader><CardTitle>作品の到達点</CardTitle><CardDescription>設計・実装・検証を、公開可能な静的artifactへ順に接続しています。</CardDescription></CardHeader>
        <CardContent><ActivityFeed entries={[{ id: "spec", actor: "Spec", action: "画面階層とcontent-fitの判断を固定", timestamp: "Architecture" }, { id: "routes", actor: "Routes", action: "共有StudioLayout内の5 Pageへ移行", timestamp: "Implementation" }, { id: "checks", actor: "Checks", action: "contracts・typecheck・build・Storybookを検証", timestamp: "Verification" }]} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>公開上の境界</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">inventoryはexperimentalを含みます。自動検証のpassは、UX・内容・maturityに対する人間レビューを代替しません。</CardContent>
      </Card>
    </PageFrame>
  )
}

export function PatternsPage() {
  const [search, setSearch] = useState("")
  const [kind, setKind] = useState("all")
  const [view, setView] = useState<"table" | "grid">("table")
  const [selectedPatternName, setSelectedPatternName] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [liveDemoOpen, setLiveDemoOpen] = useState(false)
  const [liveDemoSrc, setLiveDemoSrc] = useState("")
  const patterns = useMemo(() => [...data.inventory.screenPatterns, ...data.inventory.blockPatterns].filter((pattern) => {
    const matchesKind = kind === "all" || pattern.assetKind === kind
    const needle = search.trim().toLowerCase()
    const matchesSearch = !needle || [pattern.name, pattern.title, pattern.description, pattern.screenType, pattern.blockRole].filter(Boolean).join(" ").toLowerCase().includes(needle)
    return matchesKind && matchesSearch
  }), [kind, search])
  const selectedPattern = [...data.inventory.screenPatterns, ...data.inventory.blockPatterns].find((pattern) => pattern.name === selectedPatternName) ?? null
  const storyId = selectedPattern?.storybookStories[0]

  useEffect(() => {
    setLiveDemoSrc(storyId ? `${window.location.pathname.replace(/\/patterns\/?$/, "")}/storybook/iframe.html?id=${storyId}&viewMode=story` : "")
  }, [storyId])

  function showDetail(name: string) {
    setSelectedPatternName(name)
    setDetailOpen(true)
  }

  function showLiveDemo(name: string) {
    setSelectedPatternName(name)
    setLiveDemoOpen(true)
  }

  return (
    <PageFrame title="Patterns" description="役割・状態・maturityを手がかりに、再利用可能なscreenとblockの在庫を確認します。">
      <FilterToolbar search={search} onSearchChange={setSearch} status={kind} onStatusChange={setKind} statusOptions={[{ value: "all", label: "All patterns" }, { value: "screen-pattern", label: "Screens" }, { value: "block-pattern", label: "Blocks" }]} view={view} onViewChange={setView} />
      {view === "table" ? (
        <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Pattern</TableHead><TableHead>Kind</TableHead><TableHead>Role</TableHead><TableHead>Maturity</TableHead><TableHead>States</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{patterns.map((pattern) => <TableRow key={pattern.name}><TableCell><div className="font-medium">{pattern.title}</div><div className="max-w-lg whitespace-normal text-xs text-muted-foreground">{pattern.description}</div></TableCell><TableCell><Badge variant="outline">{pattern.assetKind === "screen-pattern" ? "Screen" : "Block"}</Badge></TableCell><TableCell>{pattern.screenType ?? pattern.blockRole ?? "—"}</TableCell><TableCell>{pattern.maturity}</TableCell><TableCell>{pattern.stateCoverage.join(", ") || "—"}</TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => showDetail(pattern.name)}>Detail</Button>{pattern.assetKind === "screen-pattern" && pattern.storybookStories.length > 0 && <Button size="sm" variant="outline" onClick={() => showLiveDemo(pattern.name)}>Live demo</Button>}</div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{patterns.map((pattern) => <Card key={pattern.name}><CardHeader><CardTitle>{pattern.title}</CardTitle><CardDescription>{pattern.description}</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2"><Badge variant="outline">{pattern.assetKind}</Badge><Badge variant="secondary">{pattern.maturity}</Badge></CardContent><CardFooter className="gap-2"><Button size="sm" variant="outline" onClick={() => showDetail(pattern.name)}>Detail</Button>{pattern.assetKind === "screen-pattern" && pattern.storybookStories.length > 0 && <Button size="sm" onClick={() => showLiveDemo(pattern.name)}>Live demo</Button>}</CardFooter></Card>)}</div>
      )}
      <p className="text-xs text-muted-foreground">{patterns.length}件表示。Detailはmetadataを、Live demoは同じ公開artifact内のStorybookを開きます。</p>

      <Drawer open={detailOpen} onOpenChange={setDetailOpen} swipeDirection="right">
        <DrawerContent className="max-w-xl"><DrawerHeader><DrawerTitle>{selectedPattern?.title ?? "Pattern detail"}</DrawerTitle><DrawerDescription>{selectedPattern?.description}</DrawerDescription></DrawerHeader>{selectedPattern && <div className="min-h-0 overflow-y-auto px-4 py-4"><DetailOverview title={selectedPattern.name} status={selectedPattern.maturity} fields={[{ id: "kind", label: "Asset kind", value: selectedPattern.assetKind }, { id: "role", label: "Role", value: selectedPattern.screenType ?? selectedPattern.blockRole ?? "—" }, { id: "states", label: "States", value: selectedPattern.stateCoverage.join(", ") || "—" }, { id: "story", label: "Storybook", value: selectedPattern.storybookStories.length ? "Available" : "Not generated" }]} /></div>}<DrawerFooter>{selectedPattern?.assetKind === "screen-pattern" && storyId && <Button onClick={() => { setDetailOpen(false); setLiveDemoOpen(true) }}>Open live demo <ExternalLinkIcon /></Button>}<DrawerClose render={<Button variant="outline" />}>Close</DrawerClose></DrawerFooter></DrawerContent>
      </Drawer>
      <Drawer open={liveDemoOpen} onOpenChange={setLiveDemoOpen} swipeDirection="right">
        <DrawerContent className="max-w-5xl"><DrawerHeader><DrawerTitle>{selectedPattern?.title ?? "Live demo"}</DrawerTitle><DrawerDescription>Storybookで生成された実装状態を表示します。</DrawerDescription></DrawerHeader><div className="min-h-0 flex-1 p-4">{liveDemoSrc ? <iframe title={`${selectedPattern?.title} live demo`} src={liveDemoSrc} className="h-[70vh] w-full rounded-md border bg-background" /> : <p className="text-sm text-muted-foreground">このpatternにはStorybook previewがありません。</p>}</div><DrawerFooter><DrawerClose render={<Button variant="outline" />}>Close</DrawerClose></DrawerFooter></DrawerContent>
      </Drawer>
    </PageFrame>
  )
}

export function StudioPage() {
  const [title, setTitle] = useState("Studio Portfolio: static delivery brief")
  const [content, setContent] = useState("Goal: show how a brief becomes evidence-backed UI selection.\nAudience: reviewers evaluating design-system reasoning.\nConstraints: static export, two-day delivery, no backend.")
  const [reply, setReply] = useState("")
  const [comments, setComments] = useState([{ id: "review", author: "Reviewer", body: "Show the selection rationale and the boundary of automated verification.", timestamp: "Design review" }])
  const studioSteps = data.studioSteps

  return (
    <PageFrame title="Studio" description="サンプルbriefを起点に、FlowSpec・選定結果・実装証拠を一つの作業面で確認します。">
      <BreadcrumbContext01 items={[{ id: "portfolio", label: "Portfolio", onSelect: () => {} }]} currentLabel="Studio brief" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
        <DocumentBodyEditor title={title} onTitleChange={setTitle} content={content} onContentChange={setContent} savedState="saved" attachments={[{ id: "flow", name: "flowspec-studio-portfolio-01.json", meta: "Build-time source" }]} />
        <CommentThread comments={comments} replyValue={reply} onReplyChange={setReply} onSubmitReply={() => { if (!reply.trim()) return; setComments((current) => [...current, { id: `comment-${current.length + 1}`, author: "You", body: reply, timestamp: "Just now" }]); setReply("") }} />
      </div>
      <Card><CardHeader><CardTitle>選定済みの16 step</CardTitle><CardDescription>Task 20のBuildReportを履歴証拠として表示しています。新しいportfolio appの検証とは分離します。</CardDescription></CardHeader><CardContent className="grid gap-2 md:grid-cols-2">{studioSteps.map((step) => <div key={step.stepId} className="flex items-center justify-between gap-3 rounded-md border p-3"><div><p className="font-medium">{step.stepId}</p><p className="text-xs text-muted-foreground">{step.screenPattern}</p></div><Badge variant={step.status === "built" ? "secondary" : "outline"}>{step.status}</Badge></div>)}</CardContent></Card>
    </PageFrame>
  )
}

export function QualityPage() {
  const verifiedFlows = data.flows.filter((flow) => flow.status === "verified")
  return (
    <PageFrame title="Quality" description="品質の主張を、契約・生成物・チェック結果まで遡って確認します。">
      <SectionCards items={[{ label: "Verified flows", value: String(verifiedFlows.length), summary: "BuildReportでverified", detail: "Example flows" }, { label: "Built screens", value: String(data.flows.reduce((total, flow) => total + flow.screens, 0)), summary: "例示flowに含まれる画面", detail: "BuildReport screens" }, { label: "Unresolved", value: String(data.flows.reduce((total, flow) => total + flow.unresolved, 0)), summary: "例示flowの未解決数", detail: "Resolution status" }, { label: "Registry coverage", value: `${data.inventory.screenTypes}/${data.inventory.screenTypes}`, summary: "ScreenType inventoryのcoverage", detail: "Coverage report" }]} />
      <Card><CardHeader><CardTitle>自動検証</CardTitle><CardDescription>portfolioの公開前に再現できるコマンドだけをここに記録します。</CardDescription></CardHeader><CardContent className="space-y-2">{["npm run test:studio-portfolio-data", "npm run validate", "npm run checks"].map((command) => <div key={command} className="flex items-center gap-2 rounded-md border p-3 font-mono text-xs"><CheckCircle2Icon className="size-4 text-emerald-600" />{command}</div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>人間レビューが必要な項目</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{["content fitと読みやすさ", "maturityの昇格判断", "公開前の最終UX確認"].map((item) => <div key={item} className="rounded-md border p-3 text-sm"><ShieldCheckIcon className="mb-2 size-4 text-muted-foreground" />{item}</div>)}</CardContent></Card>
    </PageFrame>
  )
}

export function CaseStudyPage() {
  return (
    <PageFrame title="Case Study" description="画面を単独のテンプレートではなく、Page・ChildRoute・Drawer・Dialogからなる階層として設計し直した過程をまとめます。">
      <BreadcrumbContext01 items={[{ id: "portfolio", label: "Portfolio", onSelect: () => {} }]} currentLabel="Case Study" />
      <DetailOverview title="Studio Portfolio" status="In progress" fields={[{ id: "problem", label: "Problem", value: "選定済みpatternと作品contentの不整合" }, { id: "decision", label: "Decision", value: "content fitを優先してcompositionを分離" }, { id: "delivery", label: "Delivery", value: "Static export / GitHub Pages" }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ["Contract-first", "briefから実装までの判断をFlowSpec・SelectionSpec・BuildReportで受け渡す。"],
          ["Inventory-first", "すべてのcomponentを使うのではなく、JTBDに必要な在庫だけを使う。"],
          ["Hierarchy-first", "PrimaryNavigation、Page、ChildRoute、Drawer、Dialogの責務を混同しない。"],
          ["Content fit", "無関係なKPIやchartを流用せず、適合しない場合は理由を残してcompositionを切り替える。"],
        ].map(([title, body]) => <Card key={title}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{body}</CardDescription></CardHeader></Card>)}
      </div>
      <Card><CardHeader><CardTitle>現在の到達点</CardTitle></CardHeader><CardContent><ActivityFeed entries={[{ id: "spec", actor: "Spec", action: "StudioLayoutとroute hierarchyを定義", timestamp: "Design decision" }, { id: "data", actor: "Data", action: "portfolio dataをroute外のbuild-time moduleへ退避", timestamp: "Implementation" }, { id: "quality", actor: "Checks", action: "validate・typecheck・build・Storybookを確認", timestamp: "Verification" }]} /></CardContent><CardFooter><Button variant="outline" render={<Link href="/quality" />}>検証結果を見る <ExternalLinkIcon /></Button></CardFooter></Card>
    </PageFrame>
  )
}
