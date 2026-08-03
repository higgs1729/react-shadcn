import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OnboardingScreen } from '@/app/(system)/onboarding-01/onboarding-screen'

const meta = {
  title: 'Patterns/onboarding/Onboarding 01',
  component: OnboardingScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof OnboardingScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
