import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

const meta = {
  title: 'Components/Feedback & Status/Empty',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Empty className="w-80"><EmptyHeader><EmptyTitle>No results</EmptyTitle><EmptyDescription>Nothing here yet.</EmptyDescription></EmptyHeader></Empty>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
