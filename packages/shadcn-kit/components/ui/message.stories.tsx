import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/message'

const meta = {
  title: 'Components/AI & Conversation/Message',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Message />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
