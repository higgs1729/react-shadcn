import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CheckoutSummary } from '@/components/blocks/checkout-summary-01'

function CheckoutSummaryDemo() {
  const [confirmed, setConfirmed] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      <CheckoutSummary
        items={[
          { id: '1', label: 'Pro plan (annual)', quantity: 1, price: '$290.00' },
          { id: '2', label: 'Extra seats', quantity: 3, price: '$45.00' },
        ]}
        total="$335.00"
        onConfirm={() => setConfirmed(true)}
        confirmDisabled={confirmed}
        confirmLabel={confirmed ? 'Order confirmed' : 'Confirm order'}
      />
    </div>
  )
}

const meta = {
  title: 'Blocks/checkout-summary/Checkout Summary 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <CheckoutSummaryDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
