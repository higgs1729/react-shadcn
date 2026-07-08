import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const meta = {
  title: 'Components/Data Display/Avatar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
