import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/alert-dialog'

const meta = {
  title: 'Components/Feedback & Status/Alert Dialog',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.AlertDialog />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
