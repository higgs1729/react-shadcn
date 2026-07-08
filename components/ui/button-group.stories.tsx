import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Components/Actions & Controls/Button Group',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <ButtonGroup><Button variant="outline">Left</Button><Button variant="outline">Center</Button><Button variant="outline">Right</Button></ButtonGroup>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
