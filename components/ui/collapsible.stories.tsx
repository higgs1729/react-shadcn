import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/collapsible'

const meta = {
  title: 'Components/Actions & Controls/Collapsible',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Collapsible />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
