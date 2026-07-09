import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Components/Actions & Controls/Tooltip',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <TooltipProvider><Tooltip><TooltipTrigger render={<Button variant="outline">Hover me</Button>} /><TooltipContent>Add to library</TooltipContent></Tooltip></TooltipProvider>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
