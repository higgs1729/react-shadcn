import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/resizable'

const meta = {
  title: 'Components/Layout & Navigation/Resizable',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.ResizableHandle />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
