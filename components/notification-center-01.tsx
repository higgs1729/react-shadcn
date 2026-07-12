"use client"

import { BellIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface NotificationCenterNotification {
  id: string
  title: string
  description: string
  timestamp: string
  unread: boolean
}

export interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: NotificationCenterNotification[]
  onNotificationClick?: (id: string) => void
  onMarkAllRead?: () => void
}

export function NotificationCenter({
  open,
  onOpenChange,
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Notifications">
            <span className="relative inline-flex">
              <BellIcon />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2.5 -right-2.5 h-4 min-w-4 justify-center px-1"
                >
                  {unreadCount}
                </Badge>
              )}
            </span>
          </Button>
        }
      />
      <PopoverContent className="w-80">
        <PopoverHeader className="flex-row items-center justify-between">
          <PopoverTitle>Notifications</PopoverTitle>
          {onMarkAllRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          )}
        </PopoverHeader>
        <ItemGroup>
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          )}
          {notifications.map((notification) => (
            <Item
              key={notification.id}
              variant={notification.unread ? "muted" : "default"}
              size="sm"
              render={
                <button
                  type="button"
                  onClick={() => onNotificationClick?.(notification.id)}
                />
              }
            >
              <ItemContent>
                <ItemTitle>
                  {notification.title}
                  {notification.unread && (
                    <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />
                  )}
                </ItemTitle>
                <ItemDescription>{notification.description}</ItemDescription>
                <ItemDescription className="text-xs">
                  {notification.timestamp}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </PopoverContent>
    </Popover>
  )
}
