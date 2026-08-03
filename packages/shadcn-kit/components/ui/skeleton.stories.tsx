import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Skeleton } from '@/components/ui/skeleton'

const meta = {
  title: 'Components/Feedback & Status/Skeleton',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <div className="flex flex-col gap-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-32" /></div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
