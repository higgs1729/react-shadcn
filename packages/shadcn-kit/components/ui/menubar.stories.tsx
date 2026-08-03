import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/menubar'

const meta = {
  title: 'Components/Actions & Controls/Menubar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Menubar />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
