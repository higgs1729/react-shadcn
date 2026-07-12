"use client"

import { useState } from "react"

import { BoardColumn, type BoardColumnCard } from "@/components/board-column-01"
import { AppSidebar } from "@/components/app-sidebar"
import { FilterToolbar } from "@/components/filter-toolbar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export type PlanningBoardState = "default" | "loading" | "empty" | "error"

const initialColumns: { title: string; status: string; cards: BoardColumnCard[] }[] = [
  { title: "Backlog", status: "backlog", cards: [{ id: "plan-1", title: "Define Q3 scope", description: "Confirm opportunities with product and sales.", priority: "High" }] },
  { title: "In progress", status: "in-progress", cards: [{ id: "plan-2", title: "Prototype board interactions", description: "Test state transitions with a pilot team.", priority: "Medium" }] },
  { title: "Done", status: "done", cards: [{ id: "plan-3", title: "Document workflow", description: "Publish the operating model.", priority: "Low" }] },
]

export function PlanningBoardScreen({ state = "default" }: { state?: PlanningBoardState }) {
  const [columns, setColumns] = useState(initialColumns)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [view, setView] = useState<"table" | "grid">("grid")

  function moveCard(cardId: string, targetStatus: string) {
    setColumns((current) => {
      const card = current.flatMap((column) => column.cards).find((item) => item.id === cardId)
      if (!card) return current
      return current.map((column) => ({
        ...column,
        cards: column.status === targetStatus
          ? [...column.cards.filter((item) => item.id !== cardId), card]
          : column.cards.filter((item) => item.id !== cardId),
      }))
    })
  }

  if (state === "loading") return <div className="p-8 text-sm text-muted-foreground">Loading board…</div>
  if (state === "error") return <div className="p-8 text-sm text-destructive">The planning board could not be loaded. Try again.</div>

  const visibleColumns = state === "empty" ? columns.map((column) => ({ ...column, cards: [] })) : columns

  return <SidebarProvider><AppSidebar /><SidebarInset><SiteHeader /><main className="min-h-screen bg-background p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">Product planning</p><h1 className="text-2xl font-semibold">Q3 delivery board</h1></div><Button>New work item</Button></div><div className="mb-5"><FilterToolbar search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} statusOptions={[{ value: "all", label: "All statuses" }, ...columns.map((column) => ({ value: column.status, label: column.title }))]} view={view} onViewChange={setView} /></div><div className="flex gap-4 overflow-x-auto pb-4">{visibleColumns.filter((column) => status === "all" || column.status === status).map((column) => <BoardColumn key={column.status} {...column} onCardMove={moveCard} onCreateCard={() => undefined} />)}</div></main></SidebarInset></SidebarProvider>
}
