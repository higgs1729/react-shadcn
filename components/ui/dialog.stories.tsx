import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/dialog'

const meta = {
  title: 'Components/Feedback & Status/Dialog',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Dialog />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
