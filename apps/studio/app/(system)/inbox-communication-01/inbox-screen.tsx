"use client"

import * as React from "react"
import {
  ArchiveIcon,
  InboxIcon,
  MessageSquareTextIcon,
  RotateCcwIcon,
  SendIcon,
} from "lucide-react"

import { CommentThread } from "@/components/blocks/comment-thread-01"
import {
  ConversationTriageItem,
  ConversationTriageList,
} from "@/components/blocks/conversation-triage-list-01"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import inboxData from "./data.json"

export type InboxState = "default" | "loading" | "empty" | "error"

const STATUS_OPTIONS = [
  { value: "all", label: "All conversations" },
  { value: "open", label: "Open" },
  { value: "snoozed", label: "Snoozed" },
  { value: "closed", label: "Closed" },
]

const INITIAL_CONVERSATIONS = inboxData as ConversationTriageItem[]

const COMMENTS = [
  {
    id: "message-1",
    author: "Maya Chen",
    body: "The save button stays disabled after I edit the billing address.",
    timestamp: "2m ago",
  },
  {
    id: "message-2",
    author: "Ari Bell",
    body: "Thanks, I am checking the validation state now.",
    timestamp: "Just now",
  },
]

export function InboxCommunicationScreen({ state = "default" }: { state?: InboxState }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [conversations, setConversations] = React.useState(INITIAL_CONVERSATIONS)
  const [activeConversationId, setActiveConversationId] = React.useState(
    INITIAL_CONVERSATIONS[0]?.id
  )
  const [reply, setReply] = React.useState("")
  const filtered = conversations.filter((item) => {
    const query = search.toLowerCase()
    return (status === "all" || item.status === status) && (!query || `${item.sender} ${item.subject} ${item.preview}`.toLowerCase().includes(query))
  })
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  )

  function updateConversation(
    id: string,
    update: Partial<ConversationTriageItem>
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, ...update } : conversation
      )
    )
  }

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
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <FilterToolbar search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} statusOptions={STATUS_OPTIONS} view="table" onViewChange={() => undefined} />
          {state === "error" && <Alert variant="destructive"><AlertTitle>Couldn&apos;t load conversations</AlertTitle><AlertDescription>Check your connection and try again.</AlertDescription><AlertAction><Button variant="outline" size="sm"><RotateCcwIcon />Retry</Button></AlertAction></Alert>}
          {(state === "empty" || (state === "default" && filtered.length === 0)) && <Empty className="rounded-lg border"><EmptyHeader><EmptyTitle>Inbox clear</EmptyTitle><EmptyDescription>No conversations match this view.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => { setSearch(""); setStatus("all") }}>Clear filters</Button></EmptyContent></Empty>}
          {state === "loading" && <div className="space-y-3 rounded-lg border p-4">{Array.from({ length: 5 }).map((_, index) => <Skeleton className="h-12 w-full" key={index} />)}</div>}
          {state === "default" && filtered.length > 0 && (
            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)]">
              <ConversationTriageList
                conversations={filtered}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onAssignConversation={(id) =>
                  updateConversation(id, {
                    assignee:
                      conversations.find((conversation) => conversation.id === id)
                        ?.assignee === "Ari"
                        ? "Unassigned"
                        : "Ari",
                  })
                }
                onSnoozeConversation={(id) =>
                  updateConversation(id, { status: "snoozed" })
                }
                onCloseConversation={(id) =>
                  updateConversation(id, { status: "closed" })
                }
              />
              {activeConversation && (
                <section className="min-w-0 rounded-lg border bg-background p-4">
                  <div className="mb-4 border-b pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="mr-auto text-base font-semibold">
                        {activeConversation.subject}
                      </h2>
                      <Badge variant="outline" className="capitalize">
                        {activeConversation.status}
                      </Badge>
                      {activeConversation.priority === "high" && (
                        <Badge variant="destructive">Priority</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeConversation.sender} · Assigned to {activeConversation.assignee}
                    </p>
                  </div>
                  <CommentThread
                    comments={COMMENTS}
                    replyValue={reply}
                    onReplyChange={setReply}
                    onSubmitReply={() => setReply("")}
                  />
                </section>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
