"use client"

import { Fragment } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"

export interface ActivityFeedEntry {
  id: string
  actor: string
  actorImageUrl?: string
  action: string
  timestamp: string
}

export interface ActivityFeedProps {
  entries: ActivityFeedEntry[]
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <ItemGroup>
      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          <Item size="sm">
            <ItemMedia variant="image">
              <Avatar size="sm">
                {entry.actorImageUrl && (
                  <AvatarImage src={entry.actorImageUrl} alt={entry.actor} />
                )}
                <AvatarFallback>
                  {entry.actor.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{entry.actor}</ItemTitle>
              <ItemDescription>{entry.action}</ItemDescription>
              <ItemDescription className="text-xs">
                {entry.timestamp}
              </ItemDescription>
            </ItemContent>
          </Item>
          {index < entries.length - 1 && <ItemSeparator />}
        </Fragment>
      ))}
    </ItemGroup>
  )
}
