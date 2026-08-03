import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Spinner } from '@/components/ui/spinner'

const meta = {
  title: 'Components/Feedback & Status/Spinner',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Spinner />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
