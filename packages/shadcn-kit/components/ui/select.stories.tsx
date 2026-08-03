import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/select'

const meta = {
  title: 'Components/Forms & Input/Select',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Select />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
