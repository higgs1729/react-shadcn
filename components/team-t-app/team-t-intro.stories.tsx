import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { fn } from "storybook/test"

import { introPages } from "@/lib/team-t-app/intro-tour"
import { defaultTeamTPreferences } from "@/lib/team-t-app/preferences"

import { TeamTIntro } from "./team-t-intro"
import { useTeamTAppearance } from "./use-team-t-appearance"

/**
 * TeamTIntro は shell の外で単独描画されるため、外観適用の decorator で
 * <html> のテーマ変数を種を与えて成立させる(team-t-app-shell.stories.tsx の
 * localStorage 手法と異なり、shell 自身を経由しないための代替)。
 */
function AppearanceDecorator({
  children,
}: {
  children: React.ReactNode
}) {
  useTeamTAppearance(defaultTeamTPreferences)
  return <>{children}</>
}

const meta = {
  title: "Team T/Intro",
  component: TeamTIntro,
  parameters: { layout: "fullscreen" },
  args: {
    onPageChange: fn(),
    onDemoOpen: fn(),
  },
  decorators: [
    (Story) => (
      <AppearanceDecorator>
        <Story />
      </AppearanceDecorator>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof TeamTIntro>

export default meta
type Story = StoryObj<typeof meta>

export const Page1: Story = {
  args: { pageNumber: introPages[0].page },
}

export const Page5: Story = {
  args: { pageNumber: introPages[4].page },
}

export const Page3: Story = {
  args: { pageNumber: introPages[2].page },
}
