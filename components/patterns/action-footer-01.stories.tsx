import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActionFooter } from '@/components/blocks/action-footer-01'

function ActionFooterDemo() {
  const [message, setMessage] = React.useState('')

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{message || ' '}</p>
      <ActionFooter
        primaryLabel="Save changes"
        secondaryLabel="Cancel"
        onPrimaryAction={() => setMessage('Saved')}
        onSecondaryAction={() => setMessage('Cancelled')}
      />
    </div>
  )
}

const meta = {
  title: 'Blocks/action-footer/Action Footer 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <ActionFooterDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
