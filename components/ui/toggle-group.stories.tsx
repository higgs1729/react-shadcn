import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const meta = {
  title: 'Components/Actions & Controls/Toggle Group',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <ToggleGroup><ToggleGroupItem value="a">A</ToggleGroupItem><ToggleGroupItem value="b">B</ToggleGroupItem><ToggleGroupItem value="c">C</ToggleGroupItem></ToggleGroup>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
