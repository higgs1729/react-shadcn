"use client"

import {
  ArrowRightIcon,
  Gamepad2Icon,
  Settings2Icon,
  TrophyIcon,
} from "lucide-react"

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
      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        <div className="relative overflow-hidden rounded-2xl border border-sidebar-border bg-[linear-gradient(145deg,color-mix(in_oklab,var(--sidebar-accent)_72%,var(--sidebar)),var(--sidebar))] p-2.5 shadow-[0_10px_28px_color-mix(in_oklab,var(--sidebar-foreground)_8%,transparent),inset_0_1px_color-mix(in_oklab,var(--sidebar-foreground)_8%,transparent)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-10 size-28 rounded-full bg-primary/10 blur-2xl"
          />
          <div className="relative flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[0.625rem] font-semibold tracking-[0.14em] text-sidebar-foreground/50 uppercase">
                Reward wallet
              </p>
              <TeamTCoinBalance
                coins={coinCount}
                className="mt-1 text-base leading-none"
              />
            </div>
            <div className="text-right tabular-nums">
              <p className="text-[0.625rem] text-sidebar-foreground/50">
                次のコイン
              </p>
              <p className="text-sm font-semibold text-sidebar-foreground">
                {rewardProgress}
                <span className="ml-0.5 text-[0.65rem] font-medium text-sidebar-foreground/45">
                  / 5
                </span>
              </p>
            </div>
          </div>
          <Progress
            aria-label={`次のコインまで ${rewardProgress} / 5`}
            value={(rewardProgress / 5) * 100}
            className="team-t-coin-progress relative mt-2.5 h-1.5 [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,#b7791f,#f6cf62)] [&_[data-slot=progress-indicator]]:shadow-[0_0_8px_rgba(235,180,55,0.45)] [&_[data-slot=progress-track]]:bg-sidebar-foreground/10"
          />
          <Button
            type="button"
            size="lg"
            data-team-t-arcade-button
            className="relative mt-3 h-12 w-full justify-start overflow-hidden border border-white/10 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_88%,#171019),var(--primary))] px-2.5 text-white shadow-[0_8px_20px_color-mix(in_oklab,var(--primary)_26%,transparent),inset_0_1px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_78%,#171019),color-mix(in_oklab,var(--primary)_90%,white))] hover:shadow-[0_12px_26px_color-mix(in_oklab,var(--primary)_34%,transparent),inset_0_1px_rgba(255,255,255,0.18)]"
            onClick={onGamesOpen}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/12 text-[color:var(--team-t-gold-on-primary)] ring-1 ring-white/12">
              <Gamepad2Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col items-start leading-none">
              <span className="text-[0.58rem] font-bold tracking-[0.16em] text-white/55 uppercase">
                3D Map
              </span>
              <span className="mt-1 truncate text-xs font-semibold">
                APIアーケードへ
              </span>
            </span>
            <span className="ml-auto grid size-7 shrink-0 place-items-center rounded-full bg-black/15 ring-1 ring-white/10">
              <ArrowRightIcon className="size-3.5" aria-hidden="true" />
            </span>
          </Button>
        </div>
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
