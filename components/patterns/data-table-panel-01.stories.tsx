import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DataTable } from '@/components/data-table'
import data from '@/app/dashboard-01/data.json'

const meta = {
  title: 'Blocks/data-table-panel/Data Table Panel 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => (
    <DataTable data={data} />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
