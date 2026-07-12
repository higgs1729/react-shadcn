import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WorkflowScreen } from '@/app/workflow-01/workflow-screen'

const meta = {
  title: 'Patterns/workflow/Workflow 01',
  component: WorkflowScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof WorkflowScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
