"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface AiConversationListItem {
  id: string
  title: string
  preview: string
  timestamp: string
}

export interface AiConversationListProps {
  conversations: AiConversationListItem[]
  activeConversationId: string
  onSelectConversation: (id: string) => void
  onNewConversation?: () => void
}

export function AiConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: AiConversationListProps) {
  return (
    <div className="flex h-full w-72 flex-col gap-2">
      {onNewConversation && (
        <Button
          variant="outline"
          className="justify-start"
          onClick={onNewConversation}
        >
          <PlusIcon />
          New conversation
        </Button>
      )}
      <ScrollArea className="h-80">
        <ItemGroup>
          {conversations.map((conversation) => (
            <Item
              key={conversation.id}
              size="sm"
              variant={
                conversation.id === activeConversationId ? "muted" : "default"
              }
              render={
                <button
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  aria-current={
                    conversation.id === activeConversationId
                      ? "true"
                      : undefined
                  }
                />
              }
            >
              <ItemContent>
                <ItemTitle>{conversation.title}</ItemTitle>
                <ItemDescription>{conversation.preview}</ItemDescription>
                <ItemDescription className="text-xs">
                  {conversation.timestamp}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </ScrollArea>
    </div>
  )
}
