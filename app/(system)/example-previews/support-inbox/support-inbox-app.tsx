"use client"

import * as React from "react"
import {
  ArchiveIcon,
  InboxIcon,
  MessageSquareTextIcon,
  PlusIcon,
  RotateCcwIcon,
  SendIcon,
} from "lucide-react"

import { CommentThread } from "@/components/blocks/comment-thread-01"
import {
  ConversationTriageList,
  type ConversationTriageItem,
  type ConversationTriageStatus,
} from "@/components/blocks/conversation-triage-list-01"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Message = { id: string; author: string; body: string; timestamp: string }
type Conversation = ConversationTriageItem & { messages: Message[] }

const STORAGE_KEY = "studio-example:support-inbox"
const OPERATOR = "You"

const STATUS_OPTIONS = [
  { value: "all", label: "All conversations" },
  { value: "open", label: "Open" },
  { value: "snoozed", label: "Snoozed" },
  { value: "closed", label: "Closed" },
]

// Every conversation and message below is local seed state. No messaging
// backend is connected; replies, lifecycle changes, and new conversations
// persist only to this browser's localStorage.
const seedConversations: Conversation[] = [
  {
    id: "conv-101",
    sender: "Maya Chen",
    subject: "Unable to update billing address",
    preview: "The save button stays disabled after I edit the address.",
    status: "open",
    priority: "high",
    assignee: "Unassigned",
    updated: "2m",
    messages: [
      {
        id: "conv-101-m1",
        author: "Maya Chen",
        body: "The save button stays disabled after I edit the billing address.",
        timestamp: "2m ago",
      },
    ],
  },
  {
    id: "conv-102",
    sender: "Jon Bell",
    subject: "Question about SSO rollout",
    preview: "Can we enable SAML for one workspace before the others?",
    status: "open",
    priority: "normal",
    assignee: OPERATOR,
    updated: "14m",
    messages: [
      {
        id: "conv-102-m1",
        author: "Jon Bell",
        body: "Can we enable SAML for one workspace before rolling it out to the others?",
        timestamp: "14m ago",
      },
      {
        id: "conv-102-m2",
        author: OPERATOR,
        body: "Yes — I can scope the SAML connection to a single workspace. Which one should we start with?",
        timestamp: "10m ago",
      },
    ],
  },
  {
    id: "conv-103",
    sender: "Priya Shah",
    subject: "Import completed with warnings",
    preview: "Three records were skipped and I need help understanding why.",
    status: "snoozed",
    priority: "normal",
    assignee: "Noah",
    updated: "1h",
    messages: [
      {
        id: "conv-103-m1",
        author: "Priya Shah",
        body: "The import finished but three records were skipped. Can you help me understand why?",
        timestamp: "1h ago",
      },
    ],
  },
  {
    id: "conv-104",
    sender: "Luis Ortega",
    subject: "Refund confirmation",
    preview: "Thanks, the refund is visible on our statement now.",
    status: "closed",
    priority: "normal",
    assignee: OPERATOR,
    updated: "3h",
    messages: [
      {
        id: "conv-104-m1",
        author: "Luis Ortega",
        body: "Thanks, the refund is visible on our statement now. Appreciate the quick turnaround.",
        timestamp: "3h ago",
      },
    ],
  },
]

function matchesQuery(conversation: Conversation, query: string) {
  if (!query) return true
  const haystack =
    `${conversation.sender} ${conversation.subject} ${conversation.preview}`.toLowerCase()
  return haystack.includes(query.toLowerCase())
}

function readStored(): Conversation[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Conversation[]) : null
  } catch {
    return null
  }
}

function writeStored(conversations: Conversation[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // Storage may throw inside a sandboxed iframe or private-browsing mode;
    // the inbox still works for the current render, it just won't persist.
  }
}

export function SupportInboxApp() {
  const [conversations, setConversations] =
    React.useState<Conversation[]>(seedConversations)
  const [activeId, setActiveId] = React.useState<string | undefined>(
    seedConversations[0]?.id
  )
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [view, setView] = React.useState<"table" | "grid">("table")
  const [reply, setReply] = React.useState("")
  const [nextId, setNextId] = React.useState(200)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [formSender, setFormSender] = React.useState("")
  const [formSubject, setFormSubject] = React.useState("")
  const [formMessage, setFormMessage] = React.useState("")
  const [formErrors, setFormErrors] = React.useState<{
    sender?: string
    subject?: string
    message?: string
  }>({})

  React.useEffect(() => {
    // Reading localStorage must happen after mount; a lazy initializer would
    // desync the SSR and client markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, not derived render state
    setConversations(readStored() ?? seedConversations)
  }, [])

  // Every mutation writes its result to localStorage immediately rather than
  // reacting to state in an effect, which would re-fire on every render.
  function applyConversations(next: Conversation[]) {
    setConversations(next)
    writeStored(next)
  }

  function updateConversation(id: string, update: Partial<Conversation>) {
    applyConversations(
      conversations.map((conversation) =>
        conversation.id === id ? { ...conversation, ...update } : conversation
      )
    )
  }

  const filtered = conversations.filter(
    (conversation) =>
      (status === "all" || conversation.status === status) &&
      matchesQuery(conversation, search)
  )
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  )

  function selectConversation(id: string) {
    setActiveId(id)
    setReply("")
  }

  function toggleAssignee(id: string) {
    const conversation = conversations.find((item) => item.id === id)
    if (!conversation) return
    updateConversation(id, {
      assignee: conversation.assignee === OPERATOR ? "Unassigned" : OPERATOR,
    })
  }

  function setConversationStatus(id: string, next: ConversationTriageStatus) {
    updateConversation(id, { status: next })
  }

  function submitReply() {
    if (!activeConversation) return
    const body = reply.trim()
    if (!body) return
    const message: Message = {
      id: `${activeConversation.id}-m${activeConversation.messages.length + 1}`,
      author: OPERATOR,
      body,
      timestamp: "Just now",
    }
    // A reply reopens the conversation and claims it if it was unassigned.
    updateConversation(activeConversation.id, {
      messages: [...activeConversation.messages, message],
      preview: body,
      status: "open",
      updated: "now",
      assignee:
        activeConversation.assignee === "Unassigned"
          ? OPERATOR
          : activeConversation.assignee,
    })
    setReply("")
  }

  function openCompose() {
    setFormSender("")
    setFormSubject("")
    setFormMessage("")
    setFormErrors({})
    setDialogOpen(true)
  }

  function submitCompose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sender = formSender.trim()
    const subject = formSubject.trim()
    const messageBody = formMessage.trim()
    const errors: typeof formErrors = {}
    if (!sender) errors.sender = "Enter who the message is from."
    if (!subject) errors.subject = "Enter a subject."
    if (!messageBody) errors.message = "Enter the first message."
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    const id = `conv-${nextId}`
    setNextId((value) => value + 1)
    const conversation: Conversation = {
      id,
      sender,
      subject,
      preview: messageBody,
      status: "open",
      priority: "normal",
      assignee: "Unassigned",
      updated: "now",
      messages: [
        { id: `${id}-m1`, author: sender, body: messageBody, timestamp: "Just now" },
      ],
    }
    applyConversations([conversation, ...conversations])
    setActiveId(id)
    setReply("")
    setDialogOpen(false)
  }

  function resetInbox() {
    applyConversations(seedConversations)
    setActiveId(seedConversations[0]?.id)
    setSearch("")
    setStatus("all")
    setReply("")
  }

  const openCount = conversations.filter((item) => item.status === "open").length
  const mineCount = conversations.filter(
    (item) => item.assignee === OPERATOR && item.status !== "closed"
  ).length
  const snoozedCount = conversations.filter(
    (item) => item.status === "snoozed"
  ).length

  const folders: [string, typeof InboxIcon, number][] = [
    ["Open", InboxIcon, openCount],
    ["Mine", MessageSquareTextIcon, mineCount],
    ["Snoozed", ArchiveIcon, snoozedCount],
  ]

  return (
    <div className="min-h-dvh bg-muted/30 text-foreground">
      <div className="flex min-h-dvh">
        <aside className="hidden w-52 shrink-0 flex-col border-r bg-background p-3 md:flex">
          <div className="mb-7 flex items-center gap-2 px-2 text-sm font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <SendIcon className="size-4" />
            </span>
            Support Inbox
          </div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Team inbox
          </p>
          <div className="space-y-1">
            {folders.map(([label, Icon, count]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-auto px-2 pt-10 text-xs leading-relaxed text-muted-foreground">
            Static portfolio example
            <br />
            Saved to this browser only
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-14 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
            <div>
              <p className="text-sm font-semibold">Support inbox</p>
              <p className="text-xs text-muted-foreground">
                Northstar Support / {openCount} open
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetInbox}>
                <RotateCcwIcon data-icon="inline-start" />
                Reset inbox
              </Button>
              <Button onClick={openCompose}>
                <PlusIcon data-icon="inline-start" />
                New conversation
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="mb-5">
              <FilterToolbar
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                statusOptions={STATUS_OPTIONS}
                view={view}
                onViewChange={setView}
              />
            </div>

            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)]">
              <div className="min-w-0">
                {filtered.length === 0 ? (
                  <div className="grid min-h-56 place-items-center rounded-xl border border-dashed p-6 text-center">
                    <div>
                      <InboxIcon className="mx-auto size-7 text-muted-foreground" />
                      <h2 className="mt-3 text-sm font-semibold">
                        No conversations match this view
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Clear the search or show every status to see the full
                        inbox.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setSearch("")
                          setStatus("all")
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </div>
                ) : view === "grid" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.map((conversation) => {
                      const isActive = conversation.id === activeId
                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => selectConversation(conversation.id)}
                          className={`rounded-lg border bg-background p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isActive ? "border-primary ring-1 ring-primary" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {conversation.sender}
                            </span>
                            {conversation.priority === "high" && (
                              <Badge variant="destructive">Priority</Badge>
                            )}
                          </div>
                          <p className="mt-1 truncate text-sm font-medium">
                            {conversation.subject}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {conversation.preview}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {conversation.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {conversation.assignee}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <ConversationTriageList
                    conversations={filtered}
                    activeConversationId={activeId}
                    onSelectConversation={selectConversation}
                    onAssignConversation={toggleAssignee}
                    onSnoozeConversation={(id) =>
                      setConversationStatus(id, "snoozed")
                    }
                    onCloseConversation={(id) =>
                      setConversationStatus(id, "closed")
                    }
                  />
                )}
              </div>

              {activeConversation ? (
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
                      {activeConversation.sender} · Assigned to{" "}
                      {activeConversation.assignee}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAssignee(activeConversation.id)}
                      >
                        {activeConversation.assignee === OPERATOR
                          ? "Unassign"
                          : "Assign to me"}
                      </Button>
                      {activeConversation.status !== "snoozed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConversationStatus(
                              activeConversation.id,
                              "snoozed"
                            )
                          }
                        >
                          Snooze
                        </Button>
                      )}
                      {activeConversation.status !== "closed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConversationStatus(activeConversation.id, "closed")
                          }
                        >
                          Close
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConversationStatus(activeConversation.id, "open")
                          }
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                  <CommentThread
                    comments={activeConversation.messages}
                    replyValue={reply}
                    onReplyChange={setReply}
                    onSubmitReply={submitReply}
                  />
                </section>
              ) : (
                <section className="grid min-h-56 min-w-0 place-items-center rounded-lg border border-dashed p-6 text-center">
                  <div>
                    <MessageSquareTextIcon className="mx-auto size-7 text-muted-foreground" />
                    <h2 className="mt-3 text-sm font-semibold">
                      Select a conversation
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Choose a conversation from the list to read and reply.
                    </p>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>
              Log an inbound conversation. Saved to this browser only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCompose} noValidate>
            <FieldGroup>
              <Field data-invalid={formErrors.sender ? true : undefined}>
                <FieldLabel htmlFor="support-inbox-sender">From</FieldLabel>
                <Input
                  id="support-inbox-sender"
                  value={formSender}
                  aria-invalid={formErrors.sender ? true : undefined}
                  onChange={(event) => {
                    setFormSender(event.target.value)
                    if (formErrors.sender)
                      setFormErrors((prev) => ({ ...prev, sender: undefined }))
                  }}
                  autoFocus
                />
                {formErrors.sender ? (
                  <FieldError>{formErrors.sender}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={formErrors.subject ? true : undefined}>
                <FieldLabel htmlFor="support-inbox-subject">Subject</FieldLabel>
                <Input
                  id="support-inbox-subject"
                  value={formSubject}
                  aria-invalid={formErrors.subject ? true : undefined}
                  onChange={(event) => {
                    setFormSubject(event.target.value)
                    if (formErrors.subject)
                      setFormErrors((prev) => ({ ...prev, subject: undefined }))
                  }}
                />
                {formErrors.subject ? (
                  <FieldError>{formErrors.subject}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={formErrors.message ? true : undefined}>
                <FieldLabel htmlFor="support-inbox-message">Message</FieldLabel>
                <Textarea
                  id="support-inbox-message"
                  value={formMessage}
                  aria-invalid={formErrors.message ? true : undefined}
                  onChange={(event) => {
                    setFormMessage(event.target.value)
                    if (formErrors.message)
                      setFormErrors((prev) => ({ ...prev, message: undefined }))
                  }}
                />
                {formErrors.message ? (
                  <FieldError>{formErrors.message}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add to inbox</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
