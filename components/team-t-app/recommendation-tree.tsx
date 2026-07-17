"use client"

import { ChevronRightIcon, StarIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { ApiCatalogItem } from "@/lib/team-t-app/catalog"

import { ApiPageIcon, CategoryIcon } from "./category-icon"

interface RecommendationTreeProps {
  items: readonly ApiCatalogItem[]
  selectedId: string | null
  isSearching: boolean
  onSelect: (id: string) => void
}

export function RecommendationTree({
  items,
  selectedId,
  isSearching,
  onSelect,
}: RecommendationTreeProps) {
  const groupedItems = Object.entries(
    items.reduce<Record<string, ApiCatalogItem[]>>((groups, item) => {
      groups[item.category] ??= []
      groups[item.category].push(item)
      return groups
    }, {})
  )
  const containsSelection = items.some((item) => item.id === selectedId)

  return (
    <Collapsible
      key={`${isSearching}:${containsSelection}:${items.length}`}
      defaultOpen={isSearching || containsSelection}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <CollapsibleTrigger
            data-team-t-disclosure
            className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-semibold outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <StarIcon className="size-4 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">おすすめから始める</span>
            <span className="text-xs font-normal text-sidebar-foreground/60 tabular-nums">
              {items.length}
            </span>
            <ChevronRightIcon
              data-chevron
              className="size-4 shrink-0 transition-transform"
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </SidebarMenuItem>
      </SidebarMenu>
      <CollapsibleContent>
        {items.length === 0 ? (
          <p
            className="px-3 py-2 text-xs text-sidebar-foreground/65"
            role="status"
          >
            一致するおすすめはありません
          </p>
        ) : (
          <SidebarMenuSub>
            {groupedItems.map(([category, categoryItems]) => (
              <RecommendationCategory
                key={`${category}:${isSearching}:${selectedId === null ? "" : selectedId}`}
                category={category}
                items={categoryItems}
                defaultOpen={
                  isSearching ||
                  categoryItems.some((item) => item.id === selectedId)
                }
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </SidebarMenuSub>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface RecommendationCategoryProps {
  category: string
  items: readonly ApiCatalogItem[]
  defaultOpen: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

function RecommendationCategory({
  category,
  items,
  defaultOpen,
  selectedId,
  onSelect,
}: RecommendationCategoryProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          data-team-t-disclosure
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-sidebar-foreground/75 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <CategoryIcon category={category} className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{category}</span>
          <span className="shrink-0 text-sidebar-foreground/60 tabular-nums">
            {items.length}
          </span>
          <ChevronRightIcon
            data-chevron
            className="size-3.5 shrink-0 transition-transform"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="ml-0">
            {items.map((item) => (
              <SidebarMenuSubItem
                key={item.id}
                data-team-t-leaf-container
                data-active={selectedId === item.id || undefined}
                className="relative"
              >
                <SidebarMenuButton
                  data-team-t-leaf
                  className="h-auto min-h-8 items-center py-1.5 text-xs"
                  isActive={selectedId === item.id}
                  aria-current={selectedId === item.id ? "page" : undefined}
                  onClick={() => onSelect(item.id)}
                >
                  <ApiPageIcon className="size-4" />
                  <span className="line-clamp-2 whitespace-normal">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
