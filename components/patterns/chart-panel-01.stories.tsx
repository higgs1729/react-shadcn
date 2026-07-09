import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'

const meta = {
  title: 'Blocks/chart-panel/Chart Panel 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => (
    <ChartAreaInteractive />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
