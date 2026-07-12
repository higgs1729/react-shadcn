import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ConversationAssistantScreen } from '@/app/conversation-assistant-01/conversation-assistant-screen'

const meta = {
  title: 'Patterns/conversation-assistant/Conversation Assistant 01',
  component: ConversationAssistantScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationAssistantScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
