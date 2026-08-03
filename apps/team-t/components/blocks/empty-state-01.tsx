"use client"

import * as React from "react"
import { InboxIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export interface EmptyState01Props {
  title: string
  description?: string
  actionLabel: string
  onAction: () => void
  icon?: React.ReactNode
}

export function EmptyState01({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyState01Props) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon ?? <InboxIcon />}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAction}>{actionLabel}</Button>
      </EmptyContent>
    </Empty>
  )
}
