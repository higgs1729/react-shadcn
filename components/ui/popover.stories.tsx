import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Components/Actions & Controls/Popover',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Popover><PopoverTrigger asChild><Button variant="outline">Open</Button></PopoverTrigger><PopoverContent>Popover content.</PopoverContent></Popover>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
