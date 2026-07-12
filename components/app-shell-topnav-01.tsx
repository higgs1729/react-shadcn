"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export interface AppShellTopnavItem {
  id: string
  label: string
}

export interface AppShellTopnavProps {
  brand: string
  items: AppShellTopnavItem[]
  activeItemId: string
  onItemSelect: (id: string) => void
  onSignOut?: () => void
}

export function AppShellTopnav({
  brand,
  items,
  activeItemId,
  onItemSelect,
  onSignOut,
}: AppShellTopnavProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-2">
      <span className="text-sm font-semibold">{brand}</span>
      <NavigationMenu>
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.id}>
              <NavigationMenuLink
                active={item.id === activeItemId}
                render={
                  <button
                    type="button"
                    onClick={() => onItemSelect(item.id)}
                  />
                }
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      {onSignOut && (
        <Button variant="outline" size="sm" onClick={onSignOut}>
          Sign out
        </Button>
      )}
    </div>
  )
}
