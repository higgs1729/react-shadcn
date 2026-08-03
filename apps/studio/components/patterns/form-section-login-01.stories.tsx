import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LoginForm } from '@/components/blocks/login-form'

const meta = {
  title: 'Blocks/form-section/Form Section Login 01',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <LoginForm />
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
