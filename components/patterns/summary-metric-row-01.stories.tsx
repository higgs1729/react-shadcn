import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SectionCards } from '@/components/section-cards'

const meta = {
  title: 'Blocks/summary-metric-row/Summary Metric Row 01',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <SectionCards />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
