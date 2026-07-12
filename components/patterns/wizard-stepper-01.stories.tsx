import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WizardStepper, type WizardStep } from '@/components/wizard-stepper-01'

const steps: WizardStep[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'billing', label: 'Billing' },
  { id: 'review', label: 'Review' },
]

function WizardStepperDemo() {
  return (
    <WizardStepper
      steps={steps}
      currentStepId="profile"
      completedStepIds={['account']}
    />
  )
}

const meta = {
  title: 'Blocks/wizard-stepper/Wizard Stepper 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <WizardStepperDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
