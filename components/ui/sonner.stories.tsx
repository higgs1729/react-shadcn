import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/sonner'

const meta = {
  title: 'Components/Feedback & Status/Sonner',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Toaster />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
