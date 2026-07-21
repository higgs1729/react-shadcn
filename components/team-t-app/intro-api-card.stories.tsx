import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { fn } from "storybook/test"

import { findCatalogItem } from "@/lib/team-t-app/catalog"
import { introPages } from "@/lib/team-t-app/intro-tour"
import { defaultTeamTPreferences } from "@/lib/team-t-app/preferences"

import { IntroApiCard } from "./intro-api-card"
import { useTeamTAppearance } from "./use-team-t-appearance"

/**
 * IntroApiCard は shell の外で単独描画されるため、外観適用の decorator で
 * <html> のテーマ変数を種を与えて成立させる。
 */
function AppearanceDecorator({
  children,
}: {
  children: React.ReactNode
}) {
  useTeamTAppearance(defaultTeamTPreferences)
  return <>{children}</>
}

const sindanEntry = introPages[0].main
const sindanItem = findCatalogItem(sindanEntry.id)
if (!sindanItem) throw new Error("catalog is missing entry: sindan")

const zyoukuEntry = introPages[0].others[0]
const zyoukuItem = findCatalogItem(zyoukuEntry.id)
if (!zyoukuItem) throw new Error("catalog is missing entry: zyouku")

const carsEntry = introPages[2].others[0]
const carsItem = findCatalogItem(carsEntry.id)
if (!carsItem) throw new Error("catalog is missing entry: cars")

const meta = {
  title: "Team T/Intro API Card",
  component: IntroApiCard,
  parameters: { layout: "padded" },
  args: {
    onDemoOpen: fn(),
  },
  decorators: [
    (Story) => (
      <AppearanceDecorator>
        <div className="mx-auto max-w-xl">
          <Story />
        </div>
      </AppearanceDecorator>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof IntroApiCard>

export default meta
type Story = StoryObj<typeof meta>

export const MainCard: Story = {
  args: {
    entry: sindanEntry,
    item: sindanItem,
    variant: "main",
  },
}

export const SubCard: Story = {
  args: {
    entry: zyoukuEntry,
    item: zyoukuItem,
    variant: "sub",
    onDemoOpen: undefined,
  },
}

export const MainCardCodeExpanded: Story = {
  args: {
    entry: carsEntry,
    item: carsItem,
    variant: "main",
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
      name: /Javaの実装コードを見る（/,
    })
    await userEvent.click(trigger)
  },
}

export const SubCardCodeExpanded: Story = {
  args: {
    entry: zyoukuEntry,
    item: zyoukuItem,
    variant: "sub",
    onDemoOpen: undefined,
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
      name: /Javaの実装コードを見る（/,
    })
    await userEvent.click(trigger)
  },
}

export const MainCardCodeDialogOpened: Story = {
  args: {
    entry: carsEntry,
    item: carsItem,
    variant: "main",
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
      name: /Javaの実装コードを見る（/,
    })
    await userEvent.click(trigger)
    const expandButton = canvas.getByRole("button", { name: "拡大して表示" })
    await userEvent.click(expandButton)
  },
}

export const SubCardCodeDialogOpened: Story = {
  args: {
    entry: zyoukuEntry,
    item: zyoukuItem,
    variant: "sub",
    onDemoOpen: undefined,
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
      name: /Javaの実装コードを見る（/,
    })
    await userEvent.click(trigger)
    const expandButton = canvas.getByRole("button", { name: "拡大して表示" })
    await userEvent.click(expandButton)
  },
}
