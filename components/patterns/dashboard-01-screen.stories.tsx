import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DashboardScreen } from '@/app/dashboard-01/dashboard-screen'

const meta = {
  title: 'Patterns/dashboard/Dashboard 01',
  component: DashboardScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
