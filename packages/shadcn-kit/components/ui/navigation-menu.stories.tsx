import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/navigation-menu'

const meta = {
  title: 'Components/Layout & Navigation/Navigation Menu',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.NavigationMenu />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
