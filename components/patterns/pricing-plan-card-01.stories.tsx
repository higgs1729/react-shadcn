import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PricingPlanCard } from '@/components/pricing-plan-card-01'

function PricingPlanCardDemo() {
  const [selectedPlanId, setSelectedPlanId] = React.useState('pro')

  return (
    <PricingPlanCard
      plans={[
        {
          id: 'starter',
          name: 'Starter',
          price: '$0',
          period: 'mo',
          features: ['1 project', 'Community support'],
        },
        {
          id: 'pro',
          name: 'Pro',
          price: '$29',
          period: 'mo',
          badge: 'Popular',
          features: ['Unlimited projects', 'Priority support', 'Advanced analytics'],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: '$99',
          period: 'mo',
          features: ['SSO', 'Dedicated support', 'Custom contracts'],
        },
      ]}
      selectedPlanId={selectedPlanId}
      onSelectPlan={setSelectedPlanId}
    />
  )
}

const meta = {
  title: 'Blocks/pricing-plan-card/Pricing Plan Card 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <PricingPlanCardDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
