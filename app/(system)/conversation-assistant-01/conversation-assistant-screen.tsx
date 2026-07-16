"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ActivityFeed, type ActivityFeedEntry } from "@/components/blocks/activity-feed-01"
import { AiConversationList, type AiConversationListItem } from "@/components/blocks/ai-conversation-list-01"
import { AiExplainabilityLabel } from "@/components/blocks/ai-explainability-label-01"
import { AiPromptComposer } from "@/components/blocks/ai-prompt-composer-01"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import assistantData from "./data.json"

export type ConversationAssistantState = "default" | "loading" | "empty" | "error"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  body: string
  confidence?: "low" | "medium" | "high"
  explanation?: string
}

const CONVERSATIONS = assistantData.conversations as AiConversationListItem[]
const INITIAL_MESSAGES = assistantData.messages as ChatMessage[]
const ACTIVITY = assistantData.activity as ActivityFeedEntry[]

export function ConversationAssistantScreen({
  state = "default",
}: {
  state?: ConversationAssistantState
}) {
  const [activeConversationId, setActiveConversationId] = React.useState(
    assistantData.activeConversationId as string
  )
  const [messages, setMessages] = React.useState<ChatMessage[]>(
    state === "empty" ? [] : INITIAL_MESSAGES
  )
  const [prompt, setPrompt] = React.useState("")

  function send() {
    if (!prompt.trim()) return
    setMessages((current) => [
      ...current,
      { id: `m-${current.length + 1}`, role: "user", body: prompt },
    ])
    setPrompt("")
  }

  return (
    <div className="flex h-svh w-full gap-4 p-4">
      <aside
        aria-label="Conversations"
        className="hidden shrink-0 border-r pr-4 md:block"
      >
        <AiConversationList
          conversations={CONVERSATIONS}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={() => setMessages([])}
        />
      </aside>

      <div className="flex min-w-0 flex-1 gap-4">
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-medium">Assistant</h1>
            <AiExplainabilityLabel
              confidence="medium"
              explanation="Responses are AI-generated and may be inaccurate"
            />
          </div>

          {state === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>The assistant is unavailable</AlertTitle>
              <AlertDescription>
                We couldn&apos;t reach the model. Please try again.
              </AlertDescription>
              <AlertAction>
                <Button variant="outline" size="sm">
                  <RotateCcwIcon />
                  Retry
                </Button>
              </AlertAction>
            </Alert>
          ) : (
            <ScrollArea className="min-h-0 flex-1 rounded-lg border p-4">
              {state === "loading" && (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="ml-auto h-12 w-2/3" />
                  <Skeleton className="h-20 w-4/5" />
                </div>
              )}

              {state !== "loading" && messages.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
                  <p className="text-sm font-medium">Start a new conversation</p>
                  <p className="text-sm text-muted-foreground">
                    Ask a question to get going.
                  </p>
                </div>
              )}

              {state !== "loading" && messages.length > 0 && (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.role === "user"
                          ? "ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                          : "max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm"
                      }
                    >
                      <p>{message.body}</p>
                      {message.role === "assistant" && message.explanation && (
                        <div className="mt-2">
                          <AiExplainabilityLabel
                            confidence={message.confidence ?? "low"}
                            explanation={message.explanation}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          <AiPromptComposer
            value={prompt}
            onValueChange={setPrompt}
            onSend={send}
            onAttach={() => {}}
            disabled={state === "loading" || state === "error"}
          />
        </main>

        <aside
          aria-label="Activity"
          className="hidden w-64 shrink-0 flex-col gap-3 border-l pl-4 lg:flex"
        >
          <h2 className="text-sm font-medium">Activity</h2>
          <ActivityFeed entries={ACTIVITY} />
        </aside>
      </div>
    </div>
  )
}
