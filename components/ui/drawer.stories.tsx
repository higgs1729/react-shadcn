import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/drawer'

const meta = {
  title: 'Components/Layout & Navigation/Drawer',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Drawer />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
