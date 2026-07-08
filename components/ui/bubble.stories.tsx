import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/bubble'

const meta = {
  title: 'Components/AI & Conversation/Bubble',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Bubble />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
