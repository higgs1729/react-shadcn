import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Progress } from '@/components/ui/progress'

const meta = {
  title: 'Components/Feedback & Status/Progress',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Progress className="w-64" value={60} />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
