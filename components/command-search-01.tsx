"use client"

import * as React from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export interface CommandSearchItem {
  id: string
  label: string
  shortcut?: string
  onSelect: () => void
}

export interface CommandSearchGroup {
  id: string
  heading: string
  items: CommandSearchItem[]
}

export interface CommandSearch01Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandSearchGroup[]
}

export function CommandSearch01({
  open,
  onOpenChange,
  groups,
}: CommandSearch01Props) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, index) => (
          <React.Fragment key={group.id}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem key={item.id} onSelect={item.onSelect}>
                  {item.label}
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
