import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'Components/Forms & Input/Radio Group',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <RadioGroup defaultValue="a"><div className="flex items-center gap-2"><RadioGroupItem value="a" id="ra" /><Label htmlFor="ra">Option A</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="b" id="rb" /><Label htmlFor="rb">Option B</Label></div></RadioGroup>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
