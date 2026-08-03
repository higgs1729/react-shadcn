import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DetailOverview } from '@/components/blocks/detail-overview-01'

function DetailOverviewDemo() {
  return (
    <DetailOverview
      title="Invoice #1024"
      status="Paid"
      statusVariant="secondary"
      fields={[
        { id: 'customer', label: 'Customer', value: 'Acme Corp' },
        { id: 'amount', label: 'Amount', value: '$4,200.00' },
        { id: 'issued', label: 'Issued', value: 'Jul 1, 2026' },
        { id: 'due', label: 'Due', value: 'Jul 31, 2026' },
      ]}
    />
  )
}

const meta = {
  title: 'Blocks/detail-overview/Detail Overview 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <DetailOverviewDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
