"use client"

import * as React from "react"
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  DatabaseIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  ServerCogIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type View = "overview" | "incidents" | "services"
type Period = 7 | 30 | 90
type IncidentStatus = "active" | "resolved"

type Incident = {
  id: string
  title: string
  service: string
  severity: "Critical" | "High" | "Medium"
  status: IncidentStatus
  startedAt: string
  impact: string
  owner: string
  summary: string
}

// The single source of truth for every visible number and record in this static app.
const opsFixture = {
  workspace: "Northstar",
  updatedAt: "Today, 09:42 UTC",
  periods: {
    7: { availability: 99.99, latency: 162, errorBudget: 79, labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], requests: [62, 71, 68, 82, 77, 73, 86] },
    30: { availability: 99.98, latency: 184, errorBudget: 73, labels: ["Jun 1", "Jun 5", "Jun 10", "Jun 15", "Jun 20", "Jun 25", "Jun 30"], requests: [58, 72, 66, 80, 75, 91, 84] },
    90: { availability: 99.95, latency: 206, errorBudget: 61, labels: ["Apr", "Apr 15", "May", "May 15", "Jun", "Jun 15", "Jun 30"], requests: [52, 63, 69, 60, 76, 81, 72] },
  } as Record<Period, { availability: number; latency: number; errorBudget: number; labels: string[]; requests: number[] }>,
  services: [
    { name: "Core API", owner: "Platform", availability: 99.98, latency: 184, errorBudget: 73, status: "Operational" },
    { name: "Event Pipeline", owner: "Data Systems", availability: 99.94, latency: 238, errorBudget: 64, status: "Operational" },
    { name: "Authentication", owner: "Identity", availability: 100, latency: 94, errorBudget: 91, status: "Operational" },
  ],
  incidents: [
    { id: "INC-104", title: "Webhook delivery delay", service: "Event Pipeline", severity: "High", status: "active", startedAt: "09:14 UTC", impact: "18% of delivery events are delayed by more than 10 minutes.", owner: "Maya Chen", summary: "A queue consumer rollout is processing below its expected throughput." },
    { id: "INC-102", title: "Elevated API error rate", service: "Core API", severity: "Medium", status: "active", startedAt: "08:32 UTC", impact: "0.7% of requests are returning 5xx responses.", owner: "Jordan Lee", summary: "A downstream dependency is intermittently timing out in one region." },
    { id: "INC-098", title: "File processing backlog", service: "Event Pipeline", severity: "High", status: "resolved", startedAt: "Yesterday", impact: "Resolved after capacity was increased.", owner: "Priya Shah", summary: "The processing queue returned to its normal service level." },
  ] satisfies Incident[],
}

// Icon slots are typed as LucideIcon, not React.ElementType: @react-three/fiber
// augments JSX.IntrinsicElements with three.js tags, and ElementType defaults to
// every intrinsic tag — which makes DOM props like className resolve to never.
const navItems: { view: View; label: string; icon: LucideIcon }[] = [
  { view: "overview", label: "Overview", icon: LayoutDashboardIcon },
  { view: "incidents", label: "Incidents", icon: TriangleAlertIcon },
  { view: "services", label: "Services", icon: ServerCogIcon },
]

function StatusBadge({ status }: { status: IncidentStatus | "Operational" | "Degraded" }) {
  const healthy = status === "resolved" || status === "Operational"
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${healthy ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
    {healthy ? <CheckCircle2Icon className="size-3" /> : <AlertTriangleIcon className="size-3" />}{status === "active" ? "Active" : status}
  </span>
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return <section className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{label}</span><Icon className="size-4" aria-hidden="true" /></div><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></section>
}

export function OpsPulseApp() {
  const [view, setView] = React.useState<View>("overview")
  const [period, setPeriod] = React.useState<Period>(30)
  const [resolvedIds, setResolvedIds] = React.useState<string[]>([])
  const [selectedIncidentId, setSelectedIncidentId] = React.useState<string | null>(null)
  const periodData = opsFixture.periods[period]
  const incidents = opsFixture.incidents.map((incident) => resolvedIds.includes(incident.id) ? { ...incident, status: "resolved" as const } : incident)
  const activeIncidents = incidents.filter((incident) => incident.status === "active")
  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId) ?? null
  const maxRequests = Math.max(...periodData.requests)

  return <div className="min-h-dvh bg-muted/30 text-foreground"><div className="flex min-h-dvh">
    <aside className="hidden w-52 shrink-0 flex-col border-r bg-background p-3 md:flex"><div className="mb-7 flex items-center gap-2 px-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"><ActivityIcon className="size-4" /></span>Ops Pulse</div><p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Workspace</p><nav aria-label="Ops Pulse views" className="space-y-1">{navItems.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} type="button" aria-current={view === itemView ? "page" : undefined} onClick={() => setView(itemView)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${view === itemView ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{label}{itemView === "incidents" && activeIncidents.length > 0 && <span className="ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{activeIncidents.length}</span>}</button>)}</nav><p className="mt-auto px-2 pt-10 text-xs leading-relaxed text-muted-foreground">Static portfolio example<br />No live services connected</p></aside>
    <div className="min-w-0 flex-1"><header className="flex min-h-14 items-center justify-between border-b bg-background px-4 md:px-6"><div><p className="text-sm font-semibold">{navItems.find((item) => item.view === view)?.label}</p><p className="text-xs text-muted-foreground">{opsFixture.workspace} / {opsFixture.updatedAt}</p></div><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-500" />Systems monitored</span></header><main className="mx-auto w-full max-w-6xl p-4 md:p-6">{view === "overview" && <OverviewView activeIncidents={activeIncidents} incidents={incidents} period={period} periodData={periodData} maxRequests={maxRequests} onPeriodChange={setPeriod} onIncidentSelect={setSelectedIncidentId} />}{view === "incidents" && <IncidentsView incidents={incidents} onIncidentSelect={setSelectedIncidentId} />}{view === "services" && <ServicesView activeIncidents={activeIncidents} />}</main></div>
  </div><Dialog open={selectedIncident !== null} onOpenChange={(open) => !open && setSelectedIncidentId(null)}><DialogContent className="gap-5 sm:max-w-lg" aria-describedby={undefined}>{selectedIncident && <><DialogHeader><div className="flex items-center gap-2 pr-8"><StatusBadge status={selectedIncident.status} /><span className="text-xs font-medium text-muted-foreground">{selectedIncident.id}</span></div><DialogTitle className="text-lg">{selectedIncident.title}</DialogTitle><DialogDescription>{selectedIncident.summary}</DialogDescription></DialogHeader><div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-2"><Detail label="Service" value={selectedIncident.service} /><Detail label="Severity" value={selectedIncident.severity} /><Detail label="Owner" value={selectedIncident.owner} /><Detail label="Started" value={selectedIncident.startedAt} /><div className="sm:col-span-2"><Detail label="Customer impact" value={selectedIncident.impact} /></div></div><DialogFooter>{selectedIncident.status === "active" ? <Button onClick={() => { setResolvedIds((ids) => [...ids, selectedIncident.id]); setSelectedIncidentId(null) }}><CheckCircle2Icon data-icon="inline-start" />Resolve incident</Button> : <p className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2Icon className="size-4" />This incident is resolved</p>}</DialogFooter></>}</DialogContent></Dialog></div>
}

function OverviewView({ activeIncidents, incidents, period, periodData, maxRequests, onPeriodChange, onIncidentSelect }: { activeIncidents: Incident[]; incidents: Incident[]; period: Period; periodData: (typeof opsFixture.periods)[Period]; maxRequests: number; onPeriodChange: (period: Period) => void; onIncidentSelect: (id: string) => void }) {
  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight">Service health at a glance</h1><p className="mt-1 text-sm text-muted-foreground">Metrics are calculated from the selected {period}-day operational snapshot.</p></div><div className="flex rounded-lg border bg-background p-1" aria-label="Select reporting period">{([7, 30, 90] as Period[]).map((value) => <button key={value} type="button" onClick={() => onPeriodChange(value)} aria-pressed={period === value} className={`rounded-md px-2.5 py-1 text-xs font-medium ${period === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{value} days</button>)}</div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="API availability" value={`${periodData.availability.toFixed(2)}%`} detail={`Rolling ${period}-day SLO`} icon={ShieldCheckIcon} /><MetricCard label="P95 latency" value={`${periodData.latency} ms`} detail={`Rolling ${period}-day request time`} icon={GaugeIcon} /><MetricCard label="Active incidents" value={String(activeIncidents.length)} detail={activeIncidents.length === 1 ? "One incident needs attention" : "Each incident has an owner"} icon={TriangleAlertIcon} /><MetricCard label="Error budget" value={`${periodData.errorBudget}%`} detail={`Remaining for this ${period}-day period`} icon={ActivityIcon} /></div><section className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-semibold">Request volume</h2><p className="text-xs text-muted-foreground">Requests observed across the last {period} days</p></div><span className="text-xs text-muted-foreground">Peak {maxRequests}k/day</span></div><div className="mt-6 flex h-32 items-end gap-2 border-b px-1">{periodData.requests.map((value, index) => <div key={`${period}-${index}`} className="flex h-full flex-1 flex-col justify-end gap-2" title={`${periodData.labels[index]}: ${value}k requests`}><div className="rounded-t-sm bg-primary/85 transition-all" style={{ height: `${(value / maxRequests) * 100}%` }} /><span className="truncate text-center text-[10px] text-muted-foreground">{periodData.labels[index]}</span></div>)}</div></section><IncidentTable title="Active incidents" description="Select an incident to inspect impact and resolve it." incidents={incidents.filter((incident) => incident.status === "active")} onIncidentSelect={onIncidentSelect} emptyText="No active incidents. All monitored services are healthy." /></div>
}

function IncidentsView({ incidents, onIncidentSelect }: { incidents: Incident[]; onIncidentSelect: (id: string) => void }) { return <div className="space-y-5"><div><h1 className="text-xl font-semibold tracking-tight">Incidents</h1><p className="mt-1 text-sm text-muted-foreground">Current and recently resolved events from the Ops Pulse fixture.</p></div><IncidentTable title="Incident timeline" description="Active items need attention; resolved items remain available for review." incidents={incidents} onIncidentSelect={onIncidentSelect} emptyText="No incidents recorded." /></div> }

function IncidentTable({ title, description, incidents, onIncidentSelect, emptyText }: { title: string; description: string; incidents: Incident[]; onIncidentSelect: (id: string) => void; emptyText: string }) { return <section className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="border-b p-4"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{incidents.length === 0 ? <p className="p-6 text-sm text-muted-foreground">{emptyText}</p> : <div className="divide-y">{incidents.map((incident) => <button key={incident.id} type="button" onClick={() => onIncidentSelect(incident.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"><span className={`size-2 rounded-full ${incident.status === "active" ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{incident.title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{incident.id} / {incident.service} / {incident.startedAt}</p></div><StatusBadge status={incident.status} /><ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" /></button>)}</div>}</section> }

function ServicesView({ activeIncidents }: { activeIncidents: Incident[] }) { return <div className="space-y-5"><div><h1 className="text-xl font-semibold tracking-tight">Services</h1><p className="mt-1 text-sm text-muted-foreground">Availability, latency, and budget are sourced from the same operational snapshot as Overview.</p></div><section className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="grid grid-cols-[minmax(10rem,1fr)_auto_auto_auto] gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground"><span>Service</span><span>Availability</span><span className="hidden sm:block">P95 latency</span><span>Status</span></div><div className="divide-y">{opsFixture.services.map((service) => { const related = activeIncidents.some((incident) => incident.service === service.name); const status: "Operational" | "Degraded" = related ? "Degraded" : service.status as "Operational"; return <div key={service.name} className="grid grid-cols-[minmax(10rem,1fr)_auto_auto_auto] items-center gap-3 px-4 py-4 text-sm"><div><p className="font-medium">{service.name}</p><p className="text-xs text-muted-foreground">{service.owner} / {service.errorBudget}% budget remaining</p></div><span>{service.availability.toFixed(2)}%</span><span className="hidden sm:block">{service.latency} ms</span><StatusBadge status={status} /></div> })}</div></section><p className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground"><DatabaseIcon className="size-4" />This static app uses local fixture data only; no service connection or persistence is required.</p></div> }

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p><p className="mt-0.5 text-sm">{value}</p></div> }
