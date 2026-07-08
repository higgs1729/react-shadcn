import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/command'

const meta = {
  title: 'Components/Actions & Controls/Command',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Command />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
