import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'Components/Data Display/Badge',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <div className="flex flex-wrap gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="destructive">Destructive</Badge><Badge variant="outline">Outline</Badge></div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
