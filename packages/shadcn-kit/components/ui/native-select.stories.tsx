import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/native-select'

const meta = {
  title: 'Components/Forms & Input/Native Select',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.NativeSelect />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
