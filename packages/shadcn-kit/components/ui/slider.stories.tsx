import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Slider } from '@/components/ui/slider'

const meta = {
  title: 'Components/Forms & Input/Slider',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Slider className="w-64" defaultValue={[50]} max={100} step={1} />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
