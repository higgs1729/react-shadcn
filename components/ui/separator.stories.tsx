import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Separator } from '@/components/ui/separator'

const meta = {
  title: 'Components/Layout & Navigation/Separator',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <div className="w-64 text-sm">Above<Separator className="my-2" />Below</div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
