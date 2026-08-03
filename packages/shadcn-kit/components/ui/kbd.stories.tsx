import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

const meta = {
  title: 'Components/Data Display/Kbd',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
