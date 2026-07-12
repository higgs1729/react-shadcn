import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  ActivityFeed,
  type ActivityFeedEntry,
} from '@/components/activity-feed-01'

const entries: ActivityFeedEntry[] = [
  {
    id: '1',
    actor: 'Ava Chen',
    action: 'created the invoice INV-1042.',
    timestamp: '2m ago',
  },
  {
    id: '2',
    actor: 'Marcus Lee',
    action: 'marked INV-1041 as paid.',
    timestamp: '1h ago',
  },
  {
    id: '3',
    actor: 'Priya Nair',
    action: 'left a comment on INV-1039.',
    timestamp: 'Yesterday',
  },
]

function ActivityFeedDemo() {
  return <ActivityFeed entries={entries} />
}

const meta = {
  title: 'Blocks/activity-feed/Activity Feed 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <ActivityFeedDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
