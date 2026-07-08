import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Components/Actions & Controls/Hover Card',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <HoverCard><HoverCardTrigger asChild><Button variant="link">@shadcn</Button></HoverCardTrigger><HoverCardContent>The React framework catalog.</HoverCardContent></HoverCard>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
