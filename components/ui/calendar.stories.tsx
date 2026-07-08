import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Calendar } from '@/components/ui/calendar'

const meta = {
  title: 'Components/Forms & Input/Calendar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Calendar mode="single" className="rounded-md border" />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
