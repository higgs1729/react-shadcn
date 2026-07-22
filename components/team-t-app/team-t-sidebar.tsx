"use client"

import Image from "next/image"
import { Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { ApiCatalogItem } from "@/lib/team-t-app/catalog"
import { interactionsPerCoin } from "@/lib/team-t-app/rewards"

import { CatalogSearch } from "./catalog-search"
import { CatalogTree } from "./catalog-tree"
import { RecommendationTree } from "./recommendation-tree"
import { TeamTRewardCard } from "./team-t-reward-card"
import { TeamTOverflowLabel } from "./team-t-overflow-label"

const teamTLabMarkSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/team-t-app/assets/team-t-lab-mark.png`

interface TeamTSidebarProps {
  items: readonly ApiCatalogItem[]
  recommendedItems: readonly ApiCatalogItem[]
  coinCount: number
  rewardProgress: number
  onGamesOpen: () => void
  query: string
  catalogSelectedId: string | null
  recommendationSelectedId: string | null
  categoryFilterGuideOpen: boolean
  onQueryChange: (query: string) => void
  onCategoryFilterGuideDismiss: () => void
  onSelectCatalog: (id: string) => void
  onSelectRecommendation: (id: string) => void
  onSettingsOpen: () => void
}

export function TeamTSidebar({
  items,
  recommendedItems,
  coinCount,
  rewardProgress,
  onGamesOpen,
  query,
  catalogSelectedId,
  recommendationSelectedId,
  categoryFilterGuideOpen,
  onQueryChange,
  onCategoryFilterGuideDismiss,
  onSelectCatalog,
  onSelectRecommendation,
  onSettingsOpen,
}: TeamTSidebarProps) {
  const interactionsUntilCoin = Math.max(
    0,
    interactionsPerCoin - rewardProgress
  )

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <style>{`
        /* Team T 固有の選択色とミッドナイト意匠。 */
        html[data-team-t-theme] [data-slot="sidebar-inner"] { border-right: 1px solid var(--team-t-gold-line); }
        html[data-team-t-theme="midnight"] [data-team-t-section-label] { color: color-mix(in oklab, var(--team-t-gold) 80%, transparent) !important; }
        [data-team-t-disclosure][data-panel-open] [data-chevron] { transform: rotate(90deg); }
        [data-team-t-disclosure] { color: color-mix(in oklab, var(--sidebar-foreground) 62%, transparent) !important; }
        [data-team-t-disclosure] > span { color: inherit !important; }
        [data-team-t-disclosure][data-panel-open] { color: var(--sidebar-foreground) !important; }
        [data-team-t-leaf][data-active] { background-color: color-mix(in oklab, var(--primary) 22%, transparent) !important; color: var(--sidebar-foreground) !important; }
        [data-team-t-leaf-container][data-active]::before { position: absolute; z-index: 1; top: 0.125rem; bottom: 0.125rem; left: -0.625rem; width: 0.125rem; border-radius: 9999px; background: var(--team-t-gold); content: ""; }
        [data-team-t-leaf][data-active] svg { color: var(--team-t-gold); }
      `}</style>
      <SidebarHeader className="gap-4 border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-[color:var(--team-t-gold-line)] bg-primary">
            <Image
              src={teamTLabMarkSrc}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="40px"
              className="scale-110 object-cover select-none"
            />
          </div>
          <div className="min-w-0">
            <TeamTOverflowLabel
              text="Team T API Lab"
              side="right"
              align="start"
              className="font-semibold tracking-[0.08em] text-[color:var(--team-t-gold-strong)] uppercase"
            />
            <p className="text-xs text-sidebar-foreground/65">
              触って見つける Web API
            </p>
          </div>
        </div>
        <CatalogSearch
          value={query}
          onChange={onQueryChange}
          guideOpen={categoryFilterGuideOpen}
          onGuideDismiss={onCategoryFilterGuideDismiss}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-2">
          <SidebarGroupContent>
            <RecommendationTree
              items={recommendedItems}
              selectedId={recommendationSelectedId}
              isSearching={Boolean(query.trim())}
              onSelect={onSelectRecommendation}
            />
            <p
              data-team-t-section-label
              className="px-2 pt-4 pb-2 text-xs font-medium tracking-wide text-sidebar-foreground/55 uppercase"
            >
              ジャンルから探す
            </p>
            <CatalogTree
              items={items}
              selectedId={catalogSelectedId}
              isSearching={Boolean(query.trim())}
              onSelect={onSelectCatalog}
              onClearSearch={() => onQueryChange("")}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="px-2 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start hover:bg-primary/25 hover:text-[color:var(--team-t-gold-strong)]"
          onClick={onSettingsOpen}
        >
          <Settings2Icon data-icon="inline-start" />
          設定
        </Button>
      </div>
      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        <TeamTRewardCard
          rewardAmount={coinCount}
          remaining={interactionsUntilCoin}
          total={interactionsPerCoin}
          onEnter={onGamesOpen}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
