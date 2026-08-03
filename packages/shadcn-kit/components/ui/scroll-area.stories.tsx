import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/scroll-area'

const meta = {
  title: 'Components/Layout & Navigation/Scroll Area',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.ScrollArea />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
