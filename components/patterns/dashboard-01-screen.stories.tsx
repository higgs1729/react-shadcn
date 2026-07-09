import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Screen from '@/app/flows/dryrun-saas-ops-01/overview/page'

const meta = {
  title: 'Patterns/dashboard/Dashboard 01',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  render: () => (
    <Screen />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
