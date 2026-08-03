import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  SettingsSection,
  type SettingsSectionRow,
} from '@/components/blocks/settings-section-01'

function SettingsSectionDemo() {
  const [settings, setSettings] = React.useState<SettingsSectionRow[]>([
    {
      id: 'email',
      label: 'Email notifications',
      description: 'Receive updates about your account via email.',
      checked: true,
    },
    {
      id: 'sms',
      label: 'SMS alerts',
      description: 'Get a text message for critical alerts.',
      checked: false,
    },
    {
      id: 'marketing',
      label: 'Product updates',
      description: 'Occasional emails about new features.',
      checked: false,
    },
  ])

  return (
    <SettingsSection
      title="Notifications"
      description="Choose how you want to be notified."
      settings={settings}
      onToggle={(id, checked) =>
        setSettings((prev) =>
          prev.map((s) => (s.id === id ? { ...s, checked } : s))
        )
      }
    />
  )
}

const meta = {
  title: 'Blocks/settings-section/Settings Section 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <SettingsSectionDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
