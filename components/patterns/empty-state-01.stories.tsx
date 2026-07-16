import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState01 } from '@/components/blocks/empty-state-01'

function EmptyState01Demo() {
  const [createdCount, setCreatedCount] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-2">
      <EmptyState01
        title="No projects yet"
        description="Get started by creating your first project."
        actionLabel="New project"
        onAction={() => setCreatedCount((count) => count + 1)}
      />
      <p className="text-sm text-muted-foreground">Created: {createdCount}</p>
    </div>
  )
}

const meta = {
  title: 'Blocks/empty-state/Empty State 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <EmptyState01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
