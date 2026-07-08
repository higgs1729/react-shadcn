import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/dropdown-menu'

const meta = {
  title: 'Components/Actions & Controls/Dropdown Menu',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.DropdownMenu />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
