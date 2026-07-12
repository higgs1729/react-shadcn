import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReportAnalyticsScreen } from '@/app/report-analytics-01/report-analytics-screen'

const meta = {
  title: 'Patterns/report-analytics/Report Analytics 01',
  component: ReportAnalyticsScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof ReportAnalyticsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
