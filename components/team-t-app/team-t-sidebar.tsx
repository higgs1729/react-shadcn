"use client"

import { Gamepad2Icon, Settings2Icon, TrophyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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

import { CatalogSearch } from "./catalog-search"
import { CatalogTree } from "./catalog-tree"
import { RecommendationTree } from "./recommendation-tree"
import { TeamTCoinBalance } from "./team-t-coin-balance"

interface TeamTSidebarProps {
  items: readonly ApiCatalogItem[]
  recommendedItems: readonly ApiCatalogItem[]
  coinCount: number
  rewardProgress: number
  onGamesOpen: () => void
  query: string
  catalogSelectedId: string | null
  recommendationSelectedId: string | null
  onQueryChange: (query: string) => void
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
  onQueryChange,
  onSelectCatalog,
  onSelectRecommendation,
  onSettingsOpen,
}: TeamTSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <style>{`
        /* 共有 ui/sidebar.tsx は編集禁止のため、右端の金線はここから当てる */
        html[data-team-t-theme] [data-slot="sidebar-inner"] { border-right: 1px solid var(--team-t-gold-line); }
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
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[color:var(--team-t-gold-line)] bg-primary text-[color:var(--team-t-gold-on-primary)] shadow-[0_0_16px_rgba(139,92,246,0.25)]">
            <TrophyIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold tracking-[0.08em] text-[color:var(--team-t-gold-strong)] uppercase">
              Team T API Lab
            </p>
            <p className="text-xs text-sidebar-foreground/65">
              触って見つける Web API
            </p>
          </div>
        </div>
        <CatalogSearch value={query} onChange={onQueryChange} />
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
            <p className="px-2 pt-4 pb-2 text-xs font-medium tracking-wide text-[color:var(--team-t-gold)]/80 uppercase">
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
      <SidebarFooter className="gap-1 border-t border-sidebar-border p-2">
        <div className="mb-1 space-y-2 px-2 py-2">
          <TeamTCoinBalance coins={coinCount} />
          <Progress
            aria-label={`次のコインまで ${rewardProgress} / 5`}
            value={(rewardProgress / 5) * 100}
            className="team-t-coin-progress [&_[data-slot=progress-indicator]]:bg-amber-500 [&_[data-slot=progress-track]]:bg-foreground/15"
          />
        </div>
        <Button
          type="button"
          size="lg"
          data-team-t-arcade-button
          className="relative w-full justify-start overflow-hidden border-[color:var(--team-t-gold-line)] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_88%,#171019),var(--primary))] text-white shadow-[0_8px_24px_rgba(76,35,120,0.28),inset_0_1px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_78%,#171019),color-mix(in_oklab,var(--primary)_90%,white))] hover:shadow-[0_12px_28px_rgba(76,35,120,0.34),inset_0_1px_rgba(255,255,255,0.16)]"
          onClick={onGamesOpen}
        >
          <span className="grid size-6 place-items-center rounded-md bg-white/12 text-[color:var(--team-t-gold-on-primary)] ring-1 ring-white/10">
            <Gamepad2Icon className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold">APIアーケード</span>
          <span className="ml-auto rounded-full border border-white/15 bg-black/15 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-[0.12em] text-[color:var(--team-t-gold-on-primary)] uppercase">
            Play
          </span>
        </Button>
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
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
