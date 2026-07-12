import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  AiConversationList,
  type AiConversationListItem,
} from '@/components/ai-conversation-list-01'

const conversations: AiConversationListItem[] = [
  {
    id: '1',
    title: 'Quarterly report summary',
    preview: 'Here is a summary of Q3 revenue trends...',
    timestamp: '2m ago',
  },
  {
    id: '2',
    title: 'Refactor plan',
    preview: 'The auth module can be split into...',
    timestamp: '1h ago',
  },
  {
    id: '3',
    title: 'Onboarding copy',
    preview: 'Draft welcome email for new users.',
    timestamp: 'Yesterday',
  },
]

function AiConversationListDemo() {
  const [activeConversationId, setActiveConversationId] = React.useState('1')

  return (
    <AiConversationList
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={setActiveConversationId}
      onNewConversation={() => {}}
    />
  )
}

const meta = {
  title: 'Blocks/ai-conversation-list/AI Conversation List 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <AiConversationListDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
