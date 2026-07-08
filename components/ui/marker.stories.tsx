import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/marker'

const meta = {
  title: 'Components/AI & Conversation/Marker',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Marker />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
