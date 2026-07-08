import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'Components/Forms & Input/Textarea',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Textarea className="w-64" placeholder="Type your message..." />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
