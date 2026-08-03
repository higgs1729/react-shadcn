import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TabsViewSwitcher01 } from '@/components/blocks/tabs-view-switcher-01'

function TabsViewSwitcher01Demo() {
  const [view, setView] = React.useState('list')

  return (
    <TabsViewSwitcher01
      value={view}
      onValueChange={setView}
      views={[
        { value: 'list', label: 'List', content: <p className="text-sm text-muted-foreground">List view of the data.</p> },
        { value: 'board', label: 'Board', content: <p className="text-sm text-muted-foreground">Board view of the data.</p> },
        { value: 'calendar', label: 'Calendar', content: <p className="text-sm text-muted-foreground">Calendar view of the data.</p> },
      ]}
    />
  )
}

const meta = {
  title: 'Blocks/tabs-view-switcher/Tabs View Switcher 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <TabsViewSwitcher01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
