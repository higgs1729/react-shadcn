import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/combobox'

const meta = {
  title: 'Components/Forms & Input/Combobox',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Combobox />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
