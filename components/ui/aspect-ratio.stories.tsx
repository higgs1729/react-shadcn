import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/aspect-ratio'

const meta = {
  title: 'Components/Layout & Navigation/Aspect Ratio',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.AspectRatio />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
