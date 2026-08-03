import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/chart'

const meta = {
  title: 'Components/Data Display/Chart',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.ChartContainer config={{ value: { label: 'Value', color: 'var(--chart-1)' } }} className="h-40 w-80"><div /></UI.ChartContainer>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
