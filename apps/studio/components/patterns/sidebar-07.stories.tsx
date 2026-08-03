import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AppSidebar } from '@/components/blocks/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

const meta = {
  title: 'Blocks/app-shell-sidebar/Sidebar 07',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  render: () => (
    <SidebarProvider><AppSidebar /></SidebarProvider>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
