"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ChartAreaInteractive } from "@/components/blocks/chart-area-interactive"
import { DataTable } from "@/components/blocks/data-table"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { SectionCards } from "@/components/blocks/section-cards"
import { SiteHeader } from "@/components/blocks/site-header"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import tableData from "@/app/(system)/dashboard-01/data.json"
import reportConfig from "./data.json"

export type ReportAnalyticsState = "default" | "loading" | "empty" | "error"

const PERIOD_OPTIONS = reportConfig.periodOptions as { value: string; label: string }[]

export function ReportAnalyticsScreen({
  state = "default",
}: {
  state?: ReportAnalyticsState
}) {
  const [search, setSearch] = React.useState("")
  const [period, setPeriod] = React.useState(reportConfig.selectedPeriod as string)
  const [view, setView] = React.useState<"table" | "grid">("table")

  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <h1 className="text-xl font-semibold">Revenue report</h1>
            <p className="text-sm text-muted-foreground">
              Historical performance across the selected period.
            </p>
          </div>

          <FilterToolbar
            search={search}
            onSearchChange={setSearch}
            status={period}
            onStatusChange={setPeriod}
            statusOptions={PERIOD_OPTIONS}
            view={view}
            onViewChange={setView}
          />

          {state === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t generate this report</AlertTitle>
              <AlertDescription>
                The analytics service didn&apos;t respond. Please try again.
              </AlertDescription>
              <AlertAction>
                <Button variant="outline" size="sm">
                  <RotateCcwIcon />
                  Retry
                </Button>
              </AlertAction>
            </Alert>
          )}

          {state === "loading" && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {state === "empty" && (
            <Empty className="rounded-lg border">
              <EmptyHeader>
                <EmptyTitle>No data for this period</EmptyTitle>
                <EmptyDescription>
                  Try widening the date range to see results.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => setPeriod("90d")}>
                  Switch to last 90 days
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {state === "default" && (
            <div className="flex flex-col gap-4 md:gap-6">
              <SectionCards />
              {view === "grid" ? (
                <>
                  <ChartAreaInteractive />
                  <DataTable data={tableData} />
                </>
              ) : (
                <>
                  <DataTable data={tableData} />
                  <ChartAreaInteractive />
                </>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
