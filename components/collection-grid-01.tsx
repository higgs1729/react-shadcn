"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface CollectionGridItem {
  id: string
  title: string
  description: string
  badge?: string
}

export interface CollectionGridProps {
  items: CollectionGridItem[]
  selectedId?: string
  onItemSelect: (id: string) => void
}

export function CollectionGrid({
  items,
  selectedId,
  onItemSelect,
}: CollectionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.id}
          role="button"
          tabIndex={0}
          aria-pressed={item.id === selectedId}
          onClick={() => onItemSelect(item.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onItemSelect(item.id)
            }
          }}
          className={
            item.id === selectedId
              ? "cursor-pointer ring-2 ring-ring"
              : "cursor-pointer"
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{item.title}</CardTitle>
              {item.badge && <Badge variant="outline">{item.badge}</Badge>}
            </div>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ))}
    </div>
  )
}
