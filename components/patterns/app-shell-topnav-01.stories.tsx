import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  AppShellTopnav,
  type AppShellTopnavItem,
} from '@/components/blocks/app-shell-topnav-01'

const items: AppShellTopnavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]

function AppShellTopnavDemo() {
  const [activeItemId, setActiveItemId] = React.useState('overview')

  return (
    <AppShellTopnav
      brand="Acme"
      items={items}
      activeItemId={activeItemId}
      onItemSelect={setActiveItemId}
      onSignOut={() => {}}
    />
  )
}

const meta = {
  title: 'Blocks/app-shell-topnav/App Shell Topnav 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <AppShellTopnavDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
