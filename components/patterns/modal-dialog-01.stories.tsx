import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { ModalDialog01 } from '@/components/modal-dialog-01'

function ModalDialog01Demo() {
  const [open, setOpen] = React.useState(true)
  const [name, setName] = React.useState('Website Redesign')

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Rename project
      </Button>
      <ModalDialog01
        open={open}
        onOpenChange={setOpen}
        title="Rename project"
        description="Update the name shown across the workspace."
        label="Project name"
        value={name}
        onValueChange={setName}
        onConfirm={() => setOpen(false)}
      />
    </div>
  )
}

const meta = {
  title: 'Blocks/modal-dialog/Modal Dialog 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <ModalDialog01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
