"use client"

import { ChevronRightIcon } from "lucide-react"

import { EmptyState01 } from "@/components/blocks/empty-state-01"
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
import { groupCatalog, type ApiCatalogItem } from "@/lib/team-t-app/catalog"

import { ApiPageIcon, CategoryIcon } from "./category-icon"
import { TeamTOverflowLabel } from "./team-t-overflow-label"

interface CatalogTreeProps {
  items: readonly ApiCatalogItem[]
  selectedId: string | null
  isSearching: boolean
  onSelect: (id: string) => void
  onClearSearch: () => void
}

export function CatalogTree({
  items,
  selectedId,
  isSearching,
  onSelect,
  onClearSearch,
}: CatalogTreeProps) {
  if (items.length === 0) {
    return (
      <div className="p-2">
        <EmptyState01
          title="見つかりませんでした"
          description="別のAPI名や用途で検索してみてください。"
          actionLabel="検索をクリア"
          onAction={onClearSearch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {groupCatalog(items).map((group) => {
        const groupCount = group.sections.reduce(
          (total, section) => total + section.items.length,
          0
        )
        const containsSelection = group.sections.some((section) =>
          section.items.some((item) => item.id === selectedId)
        )

        return (
          <Collapsible
            key={`${group.category}:${containsSelection}:${isSearching}`}
            defaultOpen={isSearching || containsSelection}
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <CollapsibleTrigger
                  data-team-t-disclosure
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-medium outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                  <CategoryIcon
                    category={group.category}
                    className="size-4 shrink-0"
                  />
                  <TeamTOverflowLabel
                    text={group.category}
                    side="right"
                    align="start"
                    className="flex-1"
                  />
                  <span className="shrink-0 text-xs text-sidebar-foreground/60 tabular-nums">
                    {groupCount}
                  </span>
                  <ChevronRightIcon
                    aria-hidden="true"
                    data-chevron
                    className="size-4 shrink-0 transition-transform"
                  />
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </SidebarMenu>
            <CollapsibleContent>
              {group.sections.map((section) => {
                const sectionContainsSelection = section.items.some(
                  (item) => item.id === selectedId
                )

                return (
                  <Collapsible
                    key={`${group.category}/${section.label}:${sectionContainsSelection}:${isSearching}`}
                    defaultOpen={isSearching || sectionContainsSelection}
                  >
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          data-team-t-disclosure
                          className="flex h-8 w-full items-center gap-2 rounded-md py-1 pr-2 pl-7 text-left text-xs text-sidebar-foreground/75 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                        >
                          <CategoryIcon
                            category={group.category}
                            className="size-3.5 shrink-0"
                          />
                          <TeamTOverflowLabel
                            text={section.label}
                            side="right"
                            align="start"
                            className="flex-1"
                          />
                          <span className="shrink-0 text-sidebar-foreground/60 tabular-nums">
                            {section.items.length}
                          </span>
                          <ChevronRightIcon
                            aria-hidden="true"
                            data-chevron
                            className="size-3.5 shrink-0 transition-transform"
                          />
                        </CollapsibleTrigger>
                      </SidebarMenuItem>
                    </SidebarMenu>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
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
                              aria-current={
                                selectedId === item.id ? "page" : undefined
                              }
                              onClick={() => onSelect(item.id)}
                            >
                              <ApiPageIcon className="size-4" />
                              <TeamTOverflowLabel
                                text={item.title}
                                lines={2}
                                side="right"
                                align="start"
                                className="flex-1"
                              />
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
