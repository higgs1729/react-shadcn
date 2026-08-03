import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/table'

const meta = {
  title: 'Components/Data Display/Table',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Table />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
