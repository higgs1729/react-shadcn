"use client"

import { Skeleton } from "@/components/ui/skeleton"

export interface LoadingSkeleton01Props {
  rows?: number
}

export function LoadingSkeleton01({ rows = 4 }: LoadingSkeleton01Props) {
  return (
    <div className="flex w-full flex-col gap-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
