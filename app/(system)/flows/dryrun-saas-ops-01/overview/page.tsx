import { AppSidebar } from "@/components/blocks/app-sidebar"
import { ChartAreaInteractive } from "@/components/blocks/chart-area-interactive"
import { DataTable } from "@/components/blocks/data-table"
import { SectionCards } from "@/components/blocks/section-cards"
import { SiteHeader } from "@/components/blocks/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "@/app/(system)/dashboard-01/data.json"

export default function OverviewPage() {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* transition: overview.onRowSelect -> /flows/dryrun-saas-ops-01/invoice-list */}
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
