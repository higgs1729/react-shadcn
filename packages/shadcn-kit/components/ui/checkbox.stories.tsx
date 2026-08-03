import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'Components/Forms & Input/Checkbox',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <div className="flex items-center gap-2"><Checkbox id="terms" defaultChecked /><Label htmlFor="terms">Accept terms and conditions</Label></div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
