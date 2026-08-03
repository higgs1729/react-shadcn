import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AspectRatio } from '@/components/ui/aspect-ratio'

const meta = {
  title: 'Components/Layout & Navigation/Aspect Ratio',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <div className="w-80"><AspectRatio ratio={16 / 9} className="flex items-center justify-center rounded-md bg-muted text-sm">16 : 9</AspectRatio></div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
