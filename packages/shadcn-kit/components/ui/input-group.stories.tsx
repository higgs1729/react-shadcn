import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/input-group'

const meta = {
  title: 'Components/Forms & Input/Input Group',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.InputGroup />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
