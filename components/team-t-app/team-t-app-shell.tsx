"use client"

import * as React from "react"

import { ErrorRecovery01 } from "@/components/blocks/error-recovery-01"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { filterCatalog, type ApiCatalogItem } from "@/lib/team-t-app/catalog"
import {
  defaultTeamTPreferences,
  defaultTeamTProfile,
  readTeamTPreferences,
  readTeamTProfile,
  resetTeamTPreferences,
  type TeamTPreferences,
  type TeamTProfile,
  writeTeamTPreferences,
  writeTeamTProfile,
} from "@/lib/team-t-app/preferences"
import { getRecommendedItems } from "@/lib/team-t-app/recommendations"
import {
  addTeamTCoins,
  defaultTeamTRewardState,
  readTeamTReward,
  recordPreviewInteraction,
  spendTeamTCoins,
  type TeamTRewardState,
  writeTeamTReward,
} from "@/lib/team-t-app/rewards"

import { ApiPreview } from "./api-preview"
import { TeamTCoinBurst } from "./team-t-coin-burst"
import { TeamTGameDialog } from "./team-t-game-dialog"
import { TeamTHeader, type TeamTWindow } from "./team-t-header"
import { TeamTIntro } from "./team-t-intro"
import { TeamTSettingsDialog } from "./team-t-settings-dialog"
import { TeamTSidebar } from "./team-t-sidebar"
import { TeamTWelcome } from "./team-t-welcome"
import { useTeamTAppearance } from "./use-team-t-appearance"

interface TeamTAppShellProps {
  catalog: readonly ApiCatalogItem[]
}

interface SelectionState {
  selectedId: string | null
  invalidHash: string | null
  source: "catalog" | "recommendation" | null
}

const emptySelection: SelectionState = {
  selectedId: null,
  invalidHash: null,
  source: null,
}

function readHashSelection(catalog: readonly ApiCatalogItem[]): SelectionState {
  const rawHash = window.location.hash.slice(1)
  if (!rawHash) return emptySelection

  try {
    const id = decodeURIComponent(rawHash)
    return catalog.some((item) => item.id === id)
      ? { selectedId: id, invalidHash: null, source: "catalog" }
      : { selectedId: null, invalidHash: id, source: null }
  } catch {
    return { selectedId: null, invalidHash: rawHash, source: null }
  }
}

function getLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

function TeamTAppContent({
  catalog,
  preferences,
  profile,
  reward,
  onPreferencesChange,
  onProfileChange,
  onReset,
  onPreviewInteraction,
  onSpendCoins,
  onRefundCoins,
  onAwardCoins,
}: TeamTAppShellProps & {
  preferences: TeamTPreferences
  profile: TeamTProfile
  reward: TeamTRewardState
  onPreferencesChange: (update: Partial<TeamTPreferences>) => void
  onProfileChange: (profile: TeamTProfile) => void
  onReset: () => void
  onPreviewInteraction: () => boolean
  onSpendCoins: (cost: number) => boolean
  onRefundCoins: (cost: number) => void
  onAwardCoins: (coins: number) => void
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const [query, setQuery] = React.useState("")
  const [selection, setSelection] =
    React.useState<SelectionState>(emptySelection)
  const previewRef = React.useRef<HTMLDivElement>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [gamesOpen, setGamesOpen] = React.useState(false)
  const [rewardJustEarned, setRewardJustEarned] = React.useState(false)
  const [windows, setWindows] = React.useState<TeamTWindow[]>([
    { id: "window-1", kind: "explore", apiId: null, title: "探索" },
  ])
  const [activeWindowId, setActiveWindowId] = React.useState("window-1")
  const activeWindow = windows.find((window) => window.id === activeWindowId)
  // 紹介タブは離れると unmount されるので、読んでいたページは shell が保持する
  const [introPageNumber, setIntroPageNumber] = React.useState(1)

  const createWindowId = () =>
    `window-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  React.useEffect(() => {
    if (!rewardJustEarned) return
    const timeout = window.setTimeout(() => setRewardJustEarned(false), 4000)
    return () => window.clearTimeout(timeout)
  }, [rewardJustEarned])

  React.useEffect(() => {
    const syncFromHash = () => {
      const nextSelection = readHashSelection(catalog)
      setSelection(nextSelection)
      if (nextSelection.selectedId) {
        const item = catalog.find(
          (entry) => entry.id === nextSelection.selectedId
        )
        if (item) {
          setWindows((current) =>
            current.map((window) =>
              // 紹介タブは hash を持たないので、外部からの hash 変更で上書きしない
              window.id === activeWindowId && window.kind !== "intro"
                ? { ...window, kind: "api", apiId: item.id, title: item.title }
                : window
            )
          )
        }
      }
    }
    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    window.addEventListener("popstate", syncFromHash)
    return () => {
      window.removeEventListener("hashchange", syncFromHash)
      window.removeEventListener("popstate", syncFromHash)
    }
  }, [activeWindowId, catalog])

  const filteredItems = React.useMemo(
    () => filterCatalog(catalog, query),
    [catalog, query]
  )
  const recommendedItems = React.useMemo(
    () => filterCatalog(getRecommendedItems(), query),
    [query]
  )
  const selectedItem = selection.selectedId
    ? catalog.find((item) => item.id === selection.selectedId)
    : undefined
  const pushHash = (id: string) =>
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`
    )

  /** 紹介の「デモを見る」用。今のタブを保ったまま、そのAPIのタブを追加して遷移する。 */
  const openApiWindow = (id: string) => {
    const item = catalog.find((entry) => entry.id === id)
    if (!item) return
    const windowId = createWindowId()
    setWindows((current) => [
      ...current,
      { id: windowId, kind: "api", apiId: item.id, title: item.title },
    ])
    setActiveWindowId(windowId)
    pushHash(id)
    setSelection({ selectedId: id, invalidHash: null, source: "catalog" })
    if (isMobile) setOpenMobile(false)
    window.requestAnimationFrame(() => previewRef.current?.focus())
  }

  const selectItem = (
    id: string,
    source: Exclude<SelectionState["source"], null>
  ) => {
    // 紹介タブを見ている最中の選択は、読んでいた位置を潰さないよう別タブで開く
    if (activeWindow?.kind === "intro") {
      openApiWindow(id)
      return
    }
    pushHash(id)
    setSelection({ selectedId: id, invalidHash: null, source })
    const item = catalog.find((entry) => entry.id === id)
    if (item) {
      setWindows((current) =>
        current.map((window) =>
          window.id === activeWindowId
            ? { ...window, kind: "api", apiId: item.id, title: item.title }
            : window
        )
      )
    }
    if (isMobile) setOpenMobile(false)
    window.requestAnimationFrame(() => previewRef.current?.focus())
  }

  const clearSelection = () => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    )
    setSelection(emptySelection)
  }

  const openWindow = () => {
    const id = createWindowId()
    setWindows((current) => [
      ...current,
      { id, kind: "explore", apiId: null, title: "探索" },
    ])
    setActiveWindowId(id)
    clearSelection()
  }

  /** ウェルカムの「このアプリの紹介を見る」用。紹介タブは1枚だけ持ち、既にあればそこへ戻る。 */
  const openIntroWindow = () => {
    const existing = windows.find((window) => window.kind === "intro")
    if (existing) {
      setActiveWindowId(existing.id)
      clearSelection()
      return
    }
    const id = createWindowId()
    setWindows((current) => [
      ...current,
      { id, kind: "intro", apiId: null, title: "紹介" },
    ])
    setActiveWindowId(id)
    clearSelection()
  }

  const switchWindow = (id: string) => {
    const nextWindow = windows.find((window) => window.id === id)
    if (!nextWindow) return
    setActiveWindowId(id)
    if (!nextWindow.apiId) {
      clearSelection()
      return
    }
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${encodeURIComponent(nextWindow.apiId)}`
    )
    setSelection({
      selectedId: nextWindow.apiId,
      invalidHash: null,
      source: "catalog",
    })
    window.requestAnimationFrame(() => previewRef.current?.focus())
  }

  const closeWindow = (id: string) => {
    if (windows.length === 1) return
    const index = windows.findIndex((window) => window.id === id)
    if (index === -1) return
    const remaining = windows.filter((window) => window.id !== id)
    setWindows(remaining)
    if (id === activeWindowId) {
      const nextWindow = remaining[Math.max(0, index - 1)]
      setActiveWindowId(nextWindow.id)
      if (nextWindow.apiId) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#${encodeURIComponent(nextWindow.apiId)}`
        )
        setSelection({
          selectedId: nextWindow.apiId,
          invalidHash: null,
          source: "catalog",
        })
      } else {
        clearSelection()
      }
    }
  }

  return (
    <>
      <TeamTSidebar
        items={filteredItems}
        recommendedItems={recommendedItems}
        coinCount={reward.coins}
        rewardProgress={reward.progress}
        onGamesOpen={() => setGamesOpen(true)}
        query={query}
        catalogSelectedId={
          selection.source === "recommendation" ? null : selection.selectedId
        }
        recommendationSelectedId={
          selection.source === "catalog" ? null : selection.selectedId
        }
        onQueryChange={setQuery}
        onSelectCatalog={(id) => selectItem(id, "catalog")}
        onSelectRecommendation={(id) => selectItem(id, "recommendation")}
        onSettingsOpen={() => setSettingsOpen(true)}
      />
      <SidebarInset className="min-h-svh overflow-hidden">
        <TeamTHeader
          windows={windows}
          activeWindowId={activeWindowId}
          onWindowNew={openWindow}
          onWindowSwitch={switchWindow}
          onWindowClose={closeWindow}
        />
        {activeWindow?.kind === "intro" ? (
          <TeamTIntro
            pageNumber={introPageNumber}
            onPageChange={setIntroPageNumber}
            onDemoOpen={openApiWindow}
          />
        ) : selection.invalidHash ? (
          <div className="grid min-h-[calc(100svh-3.5rem)] place-items-center p-8">
            <ErrorRecovery01
              title="指定されたAPIが見つかりません"
              description={`「${selection.invalidHash}」は現在のカタログにありません。`}
              retryLabel="カタログから探す"
              onRetry={clearSelection}
            />
          </div>
        ) : selectedItem ? (
          <div className="flex min-h-[calc(100svh-3.5rem)] flex-col">
            <ApiPreview
              item={selectedItem}
              previewRef={previewRef}
              onPreviewInteraction={() => {
                const earnedCoin = onPreviewInteraction()
                if (earnedCoin) setRewardJustEarned(true)
              }}
            />
          </div>
        ) : (
          <TeamTWelcome onIntroOpen={openIntroWindow} />
        )}
      </SidebarInset>
      <TeamTSettingsDialog
        open={settingsOpen}
        preferences={preferences}
        profile={profile}
        onOpenChange={setSettingsOpen}
        onPreferencesChange={onPreferencesChange}
        onProfileChange={onProfileChange}
        onReset={onReset}
      />
      <TeamTGameDialog
        open={gamesOpen}
        coinCount={reward.coins}
        onOpenChange={setGamesOpen}
        onSpend={onSpendCoins}
        onRefund={onRefundCoins}
        onAward={onAwardCoins}
      />
      <TeamTCoinBurst visible={rewardJustEarned} />
    </>
  )
}

export function TeamTAppShell({ catalog }: TeamTAppShellProps) {
  const [preferences, setPreferences] = React.useState<TeamTPreferences>(
    defaultTeamTPreferences
  )
  const [profile, setProfile] =
    React.useState<TeamTProfile>(defaultTeamTProfile)
  const [reward, setReward] = React.useState<TeamTRewardState>(
    defaultTeamTRewardState
  )
  const rewardRef = React.useRef<TeamTRewardState>(defaultTeamTRewardState)
  const [hasLoadedPreferences, setHasLoadedPreferences] = React.useState(false)

  React.useEffect(() => {
    const storage = getLocalStorage()
    if (storage) {
      setPreferences(readTeamTPreferences(storage))
      setProfile(readTeamTProfile(storage))
      const storedReward = readTeamTReward(storage)
      rewardRef.current = storedReward
      setReward(storedReward)
    }
    setHasLoadedPreferences(true)
  }, [])

  const updatePreferences = React.useCallback(
    (update: Partial<TeamTPreferences>) => {
      setPreferences((current) => {
        const next = { ...current, ...update }
        if (hasLoadedPreferences) {
          const storage = getLocalStorage()
          if (storage) writeTeamTPreferences(storage, next)
        }
        return next
      })
    },
    [hasLoadedPreferences]
  )

  const updateProfile = React.useCallback(
    (next: TeamTProfile) => {
      setProfile(next)
      if (hasLoadedPreferences) {
        const storage = getLocalStorage()
        if (storage) writeTeamTProfile(storage, next)
      }
    },
    [hasLoadedPreferences]
  )

  const resetPreferences = React.useCallback(() => {
    const storage = getLocalStorage()
    if (storage) resetTeamTPreferences(storage)
    setPreferences(defaultTeamTPreferences)
    setProfile(defaultTeamTProfile)
    rewardRef.current = defaultTeamTRewardState
    setReward(defaultTeamTRewardState)
  }, [])

  const recordInteraction = React.useCallback(() => {
    const result = recordPreviewInteraction(rewardRef.current)
    rewardRef.current = result.reward
    setReward(result.reward)
    if (hasLoadedPreferences) {
      const storage = getLocalStorage()
      if (storage) writeTeamTReward(storage, result.reward)
    }
    return result.earnedCoin
  }, [hasLoadedPreferences])

  const updateReward = React.useCallback(
    (next: TeamTRewardState) => {
      rewardRef.current = next
      setReward(next)
      if (hasLoadedPreferences) {
        const storage = getLocalStorage()
        if (storage) writeTeamTReward(storage, next)
      }
    },
    [hasLoadedPreferences]
  )

  const spendCoins = React.useCallback(
    (cost: number) => {
      const next = spendTeamTCoins(rewardRef.current, cost)
      if (!next) return false
      updateReward(next)
      return true
    },
    [updateReward]
  )

  const refundCoins = React.useCallback(
    (coins: number) => updateReward(addTeamTCoins(rewardRef.current, coins)),
    [updateReward]
  )

  const awardCoins = React.useCallback(
    (coins: number) => updateReward(addTeamTCoins(rewardRef.current, coins)),
    [updateReward]
  )

  useTeamTAppearance(preferences)

  return (
    <SidebarProvider>
      <TeamTAppContent
        catalog={catalog}
        preferences={preferences}
        profile={profile}
        reward={reward}
        onPreferencesChange={updatePreferences}
        onProfileChange={updateProfile}
        onReset={resetPreferences}
        onPreviewInteraction={recordInteraction}
        onSpendCoins={spendCoins}
        onRefundCoins={refundCoins}
        onAwardCoins={awardCoins}
      />
    </SidebarProvider>
  )
}
