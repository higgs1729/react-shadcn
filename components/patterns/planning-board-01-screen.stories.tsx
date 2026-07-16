import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { PlanningBoardScreen } from "@/app/(system)/planning-board-01/planning-board-screen"

const meta = {
  title: "Patterns/planning-board/Planning Board 01",
  component: PlanningBoardScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PlanningBoardScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { state: "loading" } }
export const Empty: Story = { args: { state: "empty" } }
export const Error: Story = { args: { state: "error" } }
