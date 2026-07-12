import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { BoardColumn } from "@/components/board-column-01"

const meta = {
  title: "Blocks/board-column/Board Column 01",
  component: BoardColumn,
  args: {
    title: "In progress",
    status: "in-progress",
    cards: [
      { id: "task-12", title: "Prototype board interactions", description: "Validate lane ownership and keyboard affordances.", priority: "High" },
      { id: "task-13", title: "Review workflow states", description: "Confirm status transitions with operations.", priority: "Medium" },
    ],
    onCardMove: () => undefined,
    onCreateCard: () => undefined,
  },
} satisfies Meta<typeof BoardColumn>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = { args: { cards: [] } }
