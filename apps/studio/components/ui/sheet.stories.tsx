import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/sheet'

const meta = {
  title: 'Components/Layout & Navigation/Sheet',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Sheet />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
