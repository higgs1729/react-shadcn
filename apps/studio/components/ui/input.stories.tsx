import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'Components/Forms & Input/Input',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Input className="w-64" placeholder="Email" />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
