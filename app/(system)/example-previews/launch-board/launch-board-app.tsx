"use client"

import * as React from "react"
import {
  CircleDashedIcon,
  KanbanSquareIcon,
  PencilIcon,
  PlusIcon,
  RocketIcon,
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { BoardColumn, type BoardColumnCard } from "@/components/board-column-01"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type Column = { title: string; status: string; cards: BoardColumnCard[] }

const STORAGE_KEY = "studio-example:launch-board"

// Every card and column below is local seed state. No backend is connected;
// moves, edits, and deletions persist only to this browser's localStorage.
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

function readStoredColumns(): Column[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Column[]) : null
  } catch {
    return null
  }
}

function writeStoredColumns(columns: Column[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  } catch {
    // Storage may throw inside a sandboxed iframe or private-browsing mode;
    // the board still works for the current render, it just won't persist.
  }
}

type DialogMode = { kind: "create" } | { kind: "edit"; cardId: string }

export function LaunchBoardApp() {
  const [columns, setColumns] = React.useState<Column[]>(seedColumns)
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [nextId, setNextId] = React.useState(200)
  const [dialogMode, setDialogMode] = React.useState<DialogMode | null>(null)
  const [formTitle, setFormTitle] = React.useState("")
  const [formDescription, setFormDescription] = React.useState("")
  const [formPriority, setFormPriority] = React.useState("Medium")
  const [formStatus, setFormStatus] = React.useState("backlog")
  const [titleError, setTitleError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Reading localStorage must happen after mount; there is no lazy-init
    // alternative that avoids an SSR/client markup mismatch here.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, not derived render state
    setColumns(readStoredColumns() ?? seedColumns)
  }, [])

  // Every mutation writes its result to localStorage immediately, rather than
  // reacting to state changes in an effect — that would re-trigger on every
  // render and chain into cascading updates.
  function applyColumns(next: Column[]) {
    setColumns(next)
    writeStoredColumns(next)
  }

  // A card moves by changing which column owns it. The moved card is appended
  // to the target column and removed from every other column.
  function moveCard(cardId: string, targetStatus: string) {
    const card = columns.flatMap((column) => column.cards).find((item) => item.id === cardId)
    if (!card) return
    const alreadyThere = columns.some(
      (column) => column.status === targetStatus && column.cards.some((item) => item.id === cardId)
    )
    if (alreadyThere) return
    applyColumns(
      columns.map((column) => ({
        ...column,
        cards:
          column.status === targetStatus
            ? [...column.cards.filter((item) => item.id !== cardId), card]
            : column.cards.filter((item) => item.id !== cardId),
      }))
    )
  }

  function deleteCard(cardId: string) {
    applyColumns(columns.map((column) => ({ ...column, cards: column.cards.filter((item) => item.id !== cardId) })))
  }

  function resetBoard() {
    applyColumns(seedColumns)
    setQuery("")
    setStatusFilter("all")
  }

  function openCreateDialog() {
    setFormTitle("")
    setFormDescription("")
    setFormPriority("Medium")
    setFormStatus("backlog")
    setTitleError(null)
    setDialogMode({ kind: "create" })
  }

  function openEditDialog(card: BoardColumnCard, status: string) {
    setFormTitle(card.title)
    setFormDescription(card.description ?? "")
    setFormPriority(card.priority ?? "Medium")
    setFormStatus(status)
    setTitleError(null)
    setDialogMode({ kind: "edit", cardId: card.id })
  }

  function submitDialog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dialogMode) return

    const trimmedTitle = formTitle.trim()
    if (!trimmedTitle) {
      setTitleError("Enter a title for this work item.")
      return
    }

    if (dialogMode.kind === "create") {
      const id = `REL-${nextId}`
      setNextId((value) => value + 1)
      applyColumns(
        columns.map((column) =>
          column.status === formStatus
            ? {
                ...column,
                cards: [
                  { id, title: trimmedTitle, description: formDescription.trim() || undefined, priority: formPriority },
                  ...column.cards,
                ],
              }
            : column
        )
      )
    } else {
      const { cardId } = dialogMode
      const existingCard = columns.flatMap((column) => column.cards).find((item) => item.id === cardId)
      if (existingCard) {
        const updatedCard: BoardColumnCard = {
          ...existingCard,
          title: trimmedTitle,
          description: formDescription.trim() || undefined,
          priority: formPriority,
        }
        // Remove the card from every column, then re-add it to the target
        // column — this both edits its fields and moves it if the column changed.
        applyColumns(
          columns.map((column) => ({
            ...column,
            cards:
              column.status === formStatus
                ? [...column.cards.filter((item) => item.id !== cardId), updatedCard]
                : column.cards.filter((item) => item.id !== cardId),
          }))
        )
      }
    }

    setDialogMode(null)
  }

  const totalCards = columns.reduce((sum, column) => sum + column.cards.length, 0)

  const visibleColumns = columns
    .filter((column) => statusFilter === "all" || column.status === statusFilter)
    .map((column) => ({ ...column, cards: column.cards.filter((card) => matchesQuery(card, query)) }))

  const visibleCount = visibleColumns.reduce((sum, column) => sum + column.cards.length, 0)

  const allCardsWithStatus = columns.flatMap((column) =>
    column.cards.map((card) => ({ card, status: column.status, columnTitle: column.title }))
  )

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
            Saved to this browser only
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
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetBoard}>
                <RotateCcwIcon data-icon="inline-start" />
                Reset board
              </Button>
              <Button onClick={openCreateDialog}>
                <PlusIcon data-icon="inline-start" />
                New work item
              </Button>
            </div>
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
                    onCreateCard={openCreateDialog}
                    emptyMessage="Drag a card here to update its status."
                  />
                ))}
              </div>
            )}

            <section className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b p-4">
                <h2 className="text-sm font-semibold">Manage work items</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Edit or delete any work item regardless of the filters above.
                </p>
              </div>
              {allCardsWithStatus.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No work items yet.</p>
              ) : (
                <div className="divide-y">
                  {allCardsWithStatus.map(({ card, status, columnTitle }) => (
                    <div key={card.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{card.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.id} / {columnTitle}
                          {card.priority ? ` / ${card.priority}` : ""}
                        </p>
                      </div>
                      <Button
                        aria-label={`Edit ${card.title}`}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(card, status)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        aria-label={`Delete ${card.title}`}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteCard(card.id)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode?.kind === "edit" ? "Edit work item" : "New work item"}</DialogTitle>
            <DialogDescription>
              Changes are saved to this browser only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitDialog} noValidate>
            <FieldGroup>
              <Field data-invalid={titleError ? true : undefined}>
                <FieldLabel htmlFor="launch-board-title">Title</FieldLabel>
                <Input
                  id="launch-board-title"
                  value={formTitle}
                  aria-invalid={titleError ? true : undefined}
                  onChange={(event) => {
                    setFormTitle(event.target.value)
                    if (titleError) setTitleError(null)
                  }}
                  autoFocus
                />
                {titleError ? <FieldError>{titleError}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="launch-board-description">Description</FieldLabel>
                <Input
                  id="launch-board-description"
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="launch-board-priority">Priority</FieldLabel>
                  <select
                    id="launch-board-priority"
                    value={formPriority}
                    onChange={(event) => setFormPriority(event.target.value)}
                    className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="launch-board-column">Column</FieldLabel>
                  <select
                    id="launch-board-column"
                    value={formStatus}
                    onChange={(event) => setFormStatus(event.target.value)}
                    className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
                  >
                    {columns.map((column) => (
                      <option key={column.status} value={column.status}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>
                Cancel
              </Button>
              <Button type="submit">
                {dialogMode?.kind === "edit" ? "Save changes" : "Add work item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
