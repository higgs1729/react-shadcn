import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'Components/Forms & Input/Switch',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <div className="flex items-center gap-2"><Switch id="airplane" defaultChecked /><Label htmlFor="airplane">Airplane mode</Label></div>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
