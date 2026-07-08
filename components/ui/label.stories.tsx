import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'Components/Forms & Input/Label',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Label>Email address</Label>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
