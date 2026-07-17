import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TeamTAppShell } from "@/components/team-t-app/team-t-app-shell"
import { apiCatalog } from "@/lib/team-t-app/catalog"

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
