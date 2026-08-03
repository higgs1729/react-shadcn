import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/carousel'

const meta = {
  title: 'Components/Data Display/Carousel',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <UI.Carousel />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
