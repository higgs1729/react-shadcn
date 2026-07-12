import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  NotificationCenter,
  type NotificationCenterNotification,
} from '@/components/notification-center-01'

function NotificationCenterDemo() {
  const [open, setOpen] = React.useState(true)
  const [notifications, setNotifications] = React.useState<
    NotificationCenterNotification[]
  >([
    {
      id: '1',
      title: 'New comment on your report',
      description: 'Alex left a comment on Q3 revenue report.',
      timestamp: '2m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Deploy succeeded',
      description: 'production deployed v1.4.2 successfully.',
      timestamp: '1h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Weekly summary ready',
      description: 'Your weekly analytics summary is ready to view.',
      timestamp: 'Yesterday',
      unread: false,
    },
  ])

  return (
    <NotificationCenter
      open={open}
      onOpenChange={setOpen}
      notifications={notifications}
      onNotificationClick={(id) =>
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
        )
      }
      onMarkAllRead={() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
      }
    />
  )
}

const meta = {
  title: 'Blocks/notification-center/Notification Center 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <NotificationCenterDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
