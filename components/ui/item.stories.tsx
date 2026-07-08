import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'

const meta = {
  title: 'Components/Data Display/Item',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Item className="w-80"><ItemContent><ItemTitle>Item title</ItemTitle><ItemDescription>Item description text.</ItemDescription></ItemContent></Item>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
