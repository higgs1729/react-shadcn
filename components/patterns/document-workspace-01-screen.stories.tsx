import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DocumentWorkspaceScreen } from '@/app/document-workspace-01/document-workspace-screen'

const meta = {
  title: 'Patterns/document-workspace/Document Workspace 01',
  component: DocumentWorkspaceScreen,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof DocumentWorkspaceScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { state: 'default' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }
export const Error: Story = { args: { state: 'error' } }
