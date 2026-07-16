"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { AppSidebar } from "@/components/blocks/app-sidebar"
import { SiteHeader } from "@/components/blocks/site-header"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import invoiceData from "./data.json"

export type CollectionState = "default" | "loading" | "empty" | "error"

interface Invoice {
  id: string
  customer: string
  amount: number
  status: "paid" | "pending" | "overdue"
  date: string
}

const invoices = invoiceData as Invoice[]

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
]

function currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function CollectionTableScreen({
  state = "default",
}: {
  state?: CollectionState
}) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [view, setView] = React.useState<"table" | "grid">("table")
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  const filtered = React.useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        search.trim() === "" ||
        invoice.customer.toLowerCase().includes(search.toLowerCase()) ||
        invoice.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === "all" || invoice.status === status
      return matchesSearch && matchesStatus
    })
  }, [search, status])

  function clearFilters() {
    setSearch("")
    setStatus("all")
  }

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              statusOptions={STATUS_OPTIONS}
              view={view}
              onViewChange={setView}
            />

            {state === "loading" && (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <span className="sr-only">Selection</span>
                      </TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="size-4" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="ml-auto h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {state === "empty" && (
              <Empty className="rounded-lg border">
                <EmptyHeader>
                  <EmptyTitle>No invoices found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search or status filter.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </EmptyContent>
              </Empty>
            )}

            {state === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load invoices</AlertTitle>
                <AlertDescription>
                  Something went wrong while fetching the collection. Please try again.
                </AlertDescription>
                <AlertAction>
                  <Button variant="outline" size="sm">
                    <RotateCcwIcon data-icon="inline-start" />
                    Retry
                  </Button>
                </AlertAction>
              </Alert>
            )}

            {state === "default" && filtered.length === 0 && (
              <Empty className="rounded-lg border">
                <EmptyHeader>
                  <EmptyTitle>No invoices found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search or status filter.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </EmptyContent>
              </Empty>
            )}

            {state === "default" && filtered.length > 0 && view === "table" && (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox aria-label="Select all" />
                      </TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${invoice.id}`}
                            checked={!!selected[invoice.id]}
                            onCheckedChange={(value) =>
                              setSelected((prev) => ({
                                ...prev,
                                [invoice.id]: !!value,
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell className="capitalize">{invoice.status}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell className="text-right">
                          {currency(invoice.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {state === "default" && filtered.length > 0 && view === "grid" && (
              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
                {filtered.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardHeader>
                      <CardTitle>{invoice.id}</CardTitle>
                      <CardDescription>{invoice.customer}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">
                        {invoice.status}
                      </span>
                      <span className="font-medium">{currency(invoice.amount)}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
