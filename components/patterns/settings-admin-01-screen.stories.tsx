import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SettingsAdminScreen } from '@/app/settings-admin-01/settings-admin-screen'

const meta = {
  title: 'Patterns/settings-admin/Settings Admin 01',
  component: SettingsAdminScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsAdminScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
