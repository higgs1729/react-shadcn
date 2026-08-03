import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { CommandSearch01 } from '@/components/blocks/command-search-01'

function CommandSearch01Demo() {
  const [open, setOpen] = React.useState(true)
  const [lastSelected, setLastSelected] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command search
      </Button>
      {lastSelected && (
        <p className="text-sm text-muted-foreground">Last selected: {lastSelected}</p>
      )}
      <CommandSearch01
        open={open}
        onOpenChange={setOpen}
        groups={[
          {
            id: 'pages',
            heading: 'Pages',
            items: [
              { id: 'dashboard', label: 'Dashboard', shortcut: '⌘D', onSelect: () => setLastSelected('Dashboard') },
              { id: 'settings', label: 'Settings', shortcut: '⌘S', onSelect: () => setLastSelected('Settings') },
            ],
          },
          {
            id: 'actions',
            heading: 'Actions',
            items: [
              { id: 'new-project', label: 'New project', onSelect: () => setLastSelected('New project') },
              { id: 'invite', label: 'Invite teammate', onSelect: () => setLastSelected('Invite teammate') },
            ],
          },
        ]}
      />
    </div>
  )
}

const meta = {
  title: 'Blocks/command-search/Command Search 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <CommandSearch01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
