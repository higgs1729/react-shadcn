import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/attachment'

const meta = {
  title: 'Components/AI & Conversation/Attachment',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Attachment />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
