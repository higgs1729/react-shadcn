import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/context-menu'

const meta = {
  title: 'Components/Actions & Controls/Context Menu',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.ContextMenu />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
