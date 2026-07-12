"use client"

import { CheckIcon, Clock3Icon, UserRoundPlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"

export type ConversationTriageStatus = "open" | "snoozed" | "closed"

export interface ConversationTriageItem {
  id: string
  sender: string
  subject: string
  preview: string
  status: ConversationTriageStatus
  priority: "high" | "normal"
  assignee: string
  updated: string
}

export interface ConversationTriageListProps {
  conversations: ConversationTriageItem[]
  activeConversationId?: string
  onSelectConversation: (id: string) => void
  onAssignConversation?: (id: string) => void
  onSnoozeConversation?: (id: string) => void
  onCloseConversation?: (id: string) => void
}

export function ConversationTriageList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onAssignConversation,
  onSnoozeConversation,
  onCloseConversation,
}: ConversationTriageListProps) {
  return (
    <ScrollArea className="h-[32rem] rounded-lg border bg-background">
      <ItemGroup className="gap-0 p-0">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId

          return (
            <Item
              key={conversation.id}
              className={
                isActive
                  ? "rounded-none bg-muted"
                  : "rounded-none border-b last:border-b-0"
              }
            >
              <ItemContent className="gap-2">
                <button
                  className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <ItemTitle className="min-w-0 flex-1 truncate">
                      {conversation.sender}
                    </ItemTitle>
                    {conversation.priority === "high" && (
                      <Badge variant="destructive">Priority</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {conversation.updated}
                    </span>
                  </div>
                  <ItemDescription className="mt-1 truncate font-medium text-foreground">
                    {conversation.subject}
                  </ItemDescription>
                  <ItemDescription className="truncate">
                    {conversation.preview}
                  </ItemDescription>
                </button>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant="outline" className="capitalize">
                    {conversation.status}
                  </Badge>
                  <span className="mr-auto text-xs text-muted-foreground">
                    {conversation.assignee}
                  </span>
                  {onAssignConversation && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Assign ${conversation.subject}`}
                      onClick={() => onAssignConversation(conversation.id)}
                    >
                      <UserRoundPlusIcon />
                    </Button>
                  )}
                  {onSnoozeConversation && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Snooze ${conversation.subject}`}
                      onClick={() => onSnoozeConversation(conversation.id)}
                    >
                      <Clock3Icon />
                    </Button>
                  )}
                  {onCloseConversation && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Close ${conversation.subject}`}
                      onClick={() => onCloseConversation(conversation.id)}
                    >
                      <CheckIcon />
                    </Button>
                  )}
                </div>
              </ItemContent>
            </Item>
          )
        })}
      </ItemGroup>
    </ScrollArea>
  )
}
