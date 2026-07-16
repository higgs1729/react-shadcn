import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  CommentThread,
  type CommentThreadComment,
} from '@/components/blocks/comment-thread-01'

function CommentThreadDemo() {
  const [comments, setComments] = React.useState<CommentThreadComment[]>([
    {
      id: '1',
      author: 'Ava Chen',
      body: 'Can we push the deadline by a day?',
      timestamp: '3h ago',
    },
    {
      id: '2',
      author: 'Marcus Lee',
      body: 'Works for me, updating the schedule now.',
      timestamp: '1h ago',
    },
  ])
  const [replyValue, setReplyValue] = React.useState('')

  return (
    <CommentThread
      comments={comments}
      replyValue={replyValue}
      onReplyChange={setReplyValue}
      onSubmitReply={() => {
        if (replyValue.trim().length === 0) return
        setComments((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            author: 'You',
            body: replyValue,
            timestamp: 'just now',
          },
        ])
        setReplyValue('')
      }}
    />
  )
}

const meta = {
  title: 'Blocks/comment-thread/Comment Thread 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <CommentThreadDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
