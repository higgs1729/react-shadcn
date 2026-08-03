import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FilterToolbar } from '@/components/blocks/filter-toolbar'

function FilterToolbarDemo() {
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [view, setView] = React.useState<'table' | 'grid'>('table')

  return (
    <FilterToolbar
      search={search}
      onSearchChange={setSearch}
      status={status}
      onStatusChange={setStatus}
      statusOptions={[
        { value: 'all', label: 'All statuses' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'overdue', label: 'Overdue' },
      ]}
      view={view}
      onViewChange={setView}
    />
  )
}

const meta = {
  title: 'Blocks/filter-toolbar/Filter Toolbar 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <FilterToolbarDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
