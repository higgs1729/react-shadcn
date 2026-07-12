"use client"

import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export interface ErrorRecovery01Props {
  title: string
  description?: string
  retryLabel: string
  onRetry: () => void
  icon?: React.ReactNode
}

export function ErrorRecovery01({
  title,
  description,
  retryLabel,
  onRetry,
  icon,
}: ErrorRecovery01Props) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon ?? <AlertTriangleIcon />}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
