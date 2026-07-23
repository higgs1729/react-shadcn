import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn, screen } from "storybook/test"

import { TeamTOnboardingDialog } from "./team-t-onboarding-dialog"

const meta = {
  title: "Team T/Onboarding Dialog",
  component: TeamTOnboardingDialog,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    firstRun: true,
    onOpenChange: fn(),
    onComplete: fn(),
    onSkip: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TeamTOnboardingDialog>

export default meta
type Story = StoryObj<typeof meta>

export const FirstRun: Story = {}

export const Review: Story = {
  args: { firstRun: false },
}

export const SkipConfirmation: Story = {
  play: async ({ userEvent }) => {
    await userEvent.click(screen.getByRole("button", { name: "今はスキップ" }))
  },
}

export const FinalStep: Story = {
  play: async ({ userEvent }) => {
    await userEvent.click(screen.getByRole("button", { name: "次へ" }))
    await userEvent.click(screen.getByRole("button", { name: "次へ" }))
  },
}
