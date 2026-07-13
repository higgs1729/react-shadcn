"use client"

import * as React from "react"
import {
  CircleDashedIcon,
  KanbanSquareIcon,
  PlusIcon,
  RocketIcon,
  SearchIcon,
} from "lucide-react"

import { BoardColumn, type BoardColumnCard } from "@/components/board-column-01"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Column = { title: string; status: string; cards: BoardColumnCard[] }

// Every card and column below is local seed state. Moving a card updates this
// state in the browser session only; nothing is persisted to a backend.
const seedColumns: Column[] = [
  {
    title: "Backlog",
    status: "backlog",
    cards: [
      { id: "REL-118", title: "Finalize 3.0 release scope", description: "Lock the feature list with product and eng leads.", priority: "High" },
      { id: "REL-121", title: "Draft customer changelog", description: "Summarize user-facing changes for the release note.", priority: "Medium" },
    ],
  },
  {
    title: "In progress",
    status: "in-progress",
    cards: [
      { id: "REL-109", title: "Migrate billing service", description: "Cut over to the new metering pipeline behind a flag.", priority: "High" },
      { id: "REL-114", title: "Localize onboarding", description: "Ship the first three locales for the setup flow.", priority: "Medium" },
    ],
  },
  {
    title: "In review",
    status: "in-review",
    cards: [
      { id: "REL-104", title: "Harden auth rate limits", description: "Security review of the new login throttling.", priority: "High" },
    ],
  },
  {
    title: "Ready to ship",
    status: "ready",
    cards: [
      { id: "REL-097", title: "Status page redesign", description: "Approved and staged for the release train.", priority: "Low" },
    ],
  },
]

function matchesQuery(card: BoardColumnCard, query: string) {
  if (!query) return true
  const haystack = `${card.id} ${card.title} ${card.description ?? ""}`.toLowerCase()
  return haystack.includes(query.toLowerCase())
}

export function LaunchBoardApp() {
  const [columns, setColumns] = React.useState<Column[]>(seedColumns)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [nextId, setNextId] = React.useState(200)

  // A card moves by changing which column owns it. The moved card is appended
  // to the target column and removed from every other column.
  function moveCard(cardId: string, targetStatus: string) {
    setColumns((current) => {
      const card = current.flatMap((column) => column.cards).find((item) => item.id === cardId)
      if (!card || card.id === undefined) return current
      const alreadyThere = current.some(
        (column) => column.status === targetStatus && column.cards.some((item) => item.id === cardId)
      )
      if (alreadyThere) return current
      return current.map((column) => ({
        ...column,
        cards:
          column.status === targetStatus
            ? [...column.cards.filter((item) => item.id !== cardId), card]
            : column.cards.filter((item) => item.id !== cardId),
      }))
    })
  }

  function addWorkItem() {
    const id = `REL-${nextId}`
    setNextId((value) => value + 1)
    setColumns((current) =>
      current.map((column) =>
        column.status === "backlog"
          ? {
              ...column,
              cards: [
                { id, title: "New release task", description: "Describe the work and move it across the board.", priority: "Medium" },
                ...column.cards,
              ],
            }
          : column
      )
    )
  }

  const totalCards = columns.reduce((sum, column) => sum + column.cards.length, 0)

  const visibleColumns = columns
    .filter((column) => statusFilter === "all" || column.status === statusFilter)
    .map((column) => ({ ...column, cards: column.cards.filter((card) => matchesQuery(card, query)) }))

  const visibleCount = visibleColumns.reduce((sum, column) => sum + column.cards.length, 0)

  return (
    <div className="min-h-dvh bg-muted/30 text-foreground">
      <div className="flex min-h-dvh">
        <aside className="hidden w-52 shrink-0 flex-col border-r bg-background p-3 md:flex">
          <div className="mb-7 flex items-center gap-2 px-2 text-sm font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <KanbanSquareIcon className="size-4" />
            </span>
            Launch Board
          </div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Workflow
          </p>
          <div className="space-y-1">
            {columns.map((column) => (
              <div
                key={column.status}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <CircleDashedIcon className="size-4" aria-hidden="true" />
                  {column.title}
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                  {column.cards.length}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-auto px-2 pt-10 text-xs leading-relaxed text-muted-foreground">
            Static portfolio example
            <br />
            Local seed state, not persisted
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-14 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
            <div>
              <p className="text-sm font-semibold">Q3 delivery board</p>
              <p className="text-xs text-muted-foreground">
                Northstar Release / {totalCards} work items
              </p>
            </div>
            <Button onClick={addWorkItem}>
              <PlusIcon data-icon="inline-start" />
              New work item
            </Button>
          </header>

          <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative min-w-48 flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search work items"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search work items"
                  className="pl-9"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Column
                <select
                  aria-label="Filter board by column"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
                >
                  <option value="all">All columns</option>
                  {columns.map((column) => (
                    <option key={column.status} value={column.status}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {visibleCount === 0 ? (
              <div className="grid min-h-56 place-items-center rounded-xl border border-dashed p-6 text-center">
                <div>
                  <RocketIcon className="mx-auto size-7 text-muted-foreground" />
                  <h2 className="mt-3 text-sm font-semibold">No work items match your filters</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clear the search or show every column to see the full board.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setQuery("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {visibleColumns.map((column) => (
                  <BoardColumn
                    key={column.status}
                    title={column.title}
                    status={column.status}
                    cards={column.cards}
                    onCardMove={moveCard}
                    onCreateCard={addWorkItem}
                    emptyMessage="Drag a card here to update its status."
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
