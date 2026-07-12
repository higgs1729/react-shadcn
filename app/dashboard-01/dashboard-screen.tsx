"use client"

import { RotateCcwIcon } from "lucide-react"

import { AppSidebar } from "@/components/dashboard-01/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export type DashboardState = "default" | "loading" | "empty" | "error"

export function DashboardScreen({ state = "default" }: { state?: DashboardState }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {state === "loading" && (
            <div className="space-y-4" role="status">
              <span className="sr-only">Loading dashboard</span>
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-72 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
            </div>
          )}

          {state === "empty" && (
            <Empty className="rounded-lg border">
              <EmptyHeader>
                <EmptyTitle>No dashboard data yet</EmptyTitle>
                <EmptyDescription>
                  Connect a source or refresh the workspace to populate the dashboard.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline">Refresh dashboard</Button>
              </EmptyContent>
            </Empty>
          )}

          {state === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t load the dashboard</AlertTitle>
              <AlertDescription>
                Check your connection and try loading the workspace again.
              </AlertDescription>
              <AlertAction>
                <Button variant="outline" size="sm">
                  <RotateCcwIcon data-icon="inline-start" />
                  Retry
                </Button>
              </AlertAction>
            </Alert>
          )}

          {state === "default" && (
            <>
              <SectionCards />
              <ChartAreaInteractive />
              <DataTable data={data} />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
