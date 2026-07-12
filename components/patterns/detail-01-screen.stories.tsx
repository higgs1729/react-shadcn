import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DetailScreen } from '@/app/detail-01/detail-screen'

const meta = {
  title: 'Patterns/detail/Detail 01',
  component: DetailScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof DetailScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
