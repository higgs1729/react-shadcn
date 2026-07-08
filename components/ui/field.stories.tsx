import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/field'

const meta = {
  title: 'Components/Forms & Input/Field',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Field />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
