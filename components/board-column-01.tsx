"use client"

import { PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface BoardColumnCard {
  id: string
  title: string
  description?: string
  priority?: string
}

export interface BoardColumnProps {
  title: string
  status: string
  cards: BoardColumnCard[]
  onCardMove?: (cardId: string, targetStatus: string) => void
  onCreateCard?: () => void
  emptyMessage?: string
}

export function BoardColumn({
  title,
  status,
  cards,
  onCardMove,
  onCreateCard,
  emptyMessage = "No work items in this column.",
}: BoardColumnProps) {
  function moveCard(cardId: string) {
    onCardMove?.(cardId, status)
  }

  return (
    <section
      aria-label={`${title} board column`}
      className="flex min-h-80 w-72 shrink-0 flex-col gap-3 rounded-xl bg-muted/50 p-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const cardId = event.dataTransfer.getData("text/plain")
        if (cardId) moveCard(cardId)
      }}
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <Badge variant="secondary">{cards.length}</Badge>
        </div>
        <Button
          aria-label={`Add card to ${title}`}
          size="icon-xs"
          variant="ghost"
          onClick={onCreateCard}
        >
          <PlusIcon />
        </Button>
      </header>
      <div className="flex flex-1 flex-col gap-2" role="list">
        {cards.length === 0 ? (
          <p className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          cards.map((card) => (
            <Card
              key={card.id}
              draggable
              role="listitem"
              size="sm"
              className="cursor-grab active:cursor-grabbing"
              onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
            >
              <CardHeader className="gap-2">
                <CardTitle>{card.title}</CardTitle>
                {card.priority && <Badge variant="outline">{card.priority}</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                {card.description && <p className="text-sm text-muted-foreground">{card.description}</p>}
                <Button size="xs" variant="ghost" onClick={() => moveCard(card.id)}>
                  Move to {title}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
