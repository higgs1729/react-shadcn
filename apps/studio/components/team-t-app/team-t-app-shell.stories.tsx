import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TeamTAppShell } from "@/components/team-t-app/team-t-app-shell"
import { apiCatalog } from "@/lib/team-t-app/catalog"
import {
  defaultTeamTPreferences,
  teamTStorageKeys,
  type TeamTPreferences,
} from "@/lib/team-t-app/preferences"

/**
 * 外観は <html> の data-team-t-theme へ適用されるので、story も localStorage を
 * 種にして shell 自身に適用させる(story 側でクラスを当てない)。
 */
function seedPreferences(preferences: Partial<TeamTPreferences>) {
  return () => {
    window.localStorage.setItem(
      teamTStorageKeys.preferences,
      JSON.stringify({ ...defaultTeamTPreferences, ...preferences })
    )
    return () => window.localStorage.removeItem(teamTStorageKeys.preferences)
  }
}

const meta = {
  title: "Team T/App Shell",
  component: TeamTAppShell,
  parameters: { layout: "fullscreen" },
  args: { catalog: apiCatalog.slice(0, 12) },
  tags: ["autodocs"],
} satisfies Meta<typeof TeamTAppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Welcome: Story = {}

export const SearchEmpty: Story = {
  play: async ({ canvas, userEvent }) => {
    const search = canvas.getByRole("textbox", {
      name: "APIカタログを検索",
    })
    await userEvent.type(search, "__no_match__")
  },
}

export const DarkTheme: Story = {
  beforeEach: seedPreferences({ theme: "dark" }),
}

export const LightTheme: Story = {
  beforeEach: seedPreferences({ theme: "light" }),
}

export const LightThemeWithAccent: Story = {
  beforeEach: seedPreferences({
    theme: "light",
    accent: "emerald",
    emphasizeBorders: true,
  }),
}

/** ミッドナイト選択中はアクセントが無効化されることを外観セクションで確認する。 */
export const SettingsAppearance: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "設定" }))
  },
}
