import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Screen from '@/app/flows/dryrun-saas-ops-01/login/page'

const meta = {
  title: 'Patterns/auth/Login 03',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  render: () => (
    <Screen />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
