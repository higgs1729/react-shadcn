import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/direction'

const meta = {
  title: 'Components/Utilities/Direction',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.DirectionProvider />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
