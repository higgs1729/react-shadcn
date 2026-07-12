"use client"

import * as React from "react"
import { ArchiveIcon, InboxIcon, MessageSquareTextIcon, RotateCcwIcon, SendIcon } from "lucide-react"

import { FilterToolbar } from "@/components/filter-toolbar"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import inboxData from "./data.json"

export type InboxState = "default" | "loading" | "empty" | "error"

const STATUS_OPTIONS = [
  { value: "all", label: "All conversations" },
  { value: "open", label: "Open" },
  { value: "snoozed", label: "Snoozed" },
  { value: "closed", label: "Closed" },
]

export function InboxCommunicationScreen({ state = "default" }: { state?: InboxState }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const filtered = inboxData.filter((item) => {
    const query = search.toLowerCase()
    return (status === "all" || item.status === status) && (!query || `${item.sender} ${item.subject} ${item.preview}`.toLowerCase().includes(query))
  })

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Team inbox</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[["Open", InboxIcon, "12"], ["Mine", MessageSquareTextIcon, "5"], ["Snoozed", ArchiveIcon, "3"], ["Sent", SendIcon, ""]].map(([label, Icon, count]) => (
                  <SidebarMenuItem key={label as string}>
                    <SidebarMenuButton isActive={label === "Open"} tooltip={label as string}>
                      <Icon /><span>{label as string}</span>
                      {count && <Badge className="ml-auto" variant="secondary">{count as string}</Badge>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">Support inbox</h1>
          <Button size="sm">New message</Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <FilterToolbar search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} statusOptions={STATUS_OPTIONS} view="table" onViewChange={() => undefined} />
          {state === "error" && <Alert variant="destructive"><AlertTitle>Couldn&apos;t load conversations</AlertTitle><AlertDescription>Check your connection and try again.</AlertDescription><AlertAction><Button variant="outline" size="sm"><RotateCcwIcon />Retry</Button></AlertAction></Alert>}
          {(state === "empty" || (state === "default" && filtered.length === 0)) && <Empty className="rounded-lg border"><EmptyHeader><EmptyTitle>Inbox clear</EmptyTitle><EmptyDescription>No conversations match this view.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => { setSearch(""); setStatus("all") }}>Clear filters</Button></EmptyContent></Empty>}
          {state === "loading" && <div className="space-y-3 rounded-lg border p-4">{Array.from({ length: 5 }).map((_, index) => <Skeleton className="h-12 w-full" key={index} />)}</div>}
          {state === "default" && filtered.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader><TableRow><TableHead className="w-10"><span className="sr-only">Select</span></TableHead><TableHead>Conversation</TableHead><TableHead>Status</TableHead><TableHead>Assignee</TableHead><TableHead className="text-right">Updated</TableHead></TableRow></TableHeader>
                <TableBody>{filtered.map((item) => <TableRow key={item.id}>
                  <TableCell><Checkbox aria-label={`Select conversation from ${item.sender}`} checked={!!selected[item.id]} onCheckedChange={(value) => setSelected((current) => ({ ...current, [item.id]: !!value }))} /></TableCell>
                  <TableCell><div className="max-w-xl"><div className="flex items-center gap-2 font-medium"><span>{item.sender}</span>{item.priority === "high" && <Badge variant="destructive">Priority</Badge>}</div><div className="truncate text-sm">{item.subject}</div><div className="truncate text-sm text-muted-foreground">{item.preview}</div></div></TableCell>
                  <TableCell className="capitalize">{item.status}</TableCell><TableCell>{item.assignee}</TableCell><TableCell className="text-right text-muted-foreground">{item.updated}</TableCell>
                </TableRow>)}</TableBody>
              </Table>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
