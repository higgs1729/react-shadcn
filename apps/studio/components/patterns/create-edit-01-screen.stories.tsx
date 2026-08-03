import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CreateEditScreen } from '@/app/(system)/create-edit-01/create-edit-screen'

const meta = {
  title: 'Patterns/create-edit/Create Edit 01',
  component: CreateEditScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateEditScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
