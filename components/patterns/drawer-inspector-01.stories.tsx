import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { DrawerInspector01 } from '@/components/drawer-inspector-01'

function DrawerInspector01Demo() {
  const [open, setOpen] = React.useState(true)
  const [name, setName] = React.useState('Ada Lovelace')
  const [email, setEmail] = React.useState('ada@example.com')

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Inspect record
      </Button>
      <DrawerInspector01
        open={open}
        onOpenChange={setOpen}
        title="Contact details"
        description="Review and edit this contact without leaving the list."
        fields={[
          { id: 'name', label: 'Name', value: name, onValueChange: setName },
          { id: 'email', label: 'Email', value: email, onValueChange: setEmail },
        ]}
        onSave={() => setOpen(false)}
      />
    </div>
  )
}

const meta = {
  title: 'Blocks/drawer-inspector/Drawer Inspector 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <DrawerInspector01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
