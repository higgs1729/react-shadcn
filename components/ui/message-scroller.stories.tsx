import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/message-scroller'

const meta = {
  title: 'Components/AI & Conversation/Message Scroller',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.MessageScroller />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
