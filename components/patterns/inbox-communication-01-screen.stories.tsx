import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InboxCommunicationScreen } from '@/app/inbox-communication-01/inbox-screen'

const meta = {
  title: 'Patterns/inbox-communication/Inbox Communication 01',
  component: InboxCommunicationScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof InboxCommunicationScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
