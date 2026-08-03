import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Toggle } from '@/components/ui/toggle'

const meta = {
  title: 'Components/Actions & Controls/Toggle',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Toggle>Bold</Toggle>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
