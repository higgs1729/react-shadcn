import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as UI from '@/components/ui/sidebar'

const meta = {
  title: 'Components/Layout & Navigation/Sidebar',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  render: () => (
    <UI.SidebarProvider><UI.Sidebar><UI.SidebarHeader className="p-2">Header</UI.SidebarHeader><UI.SidebarContent><UI.SidebarGroup>Navigation</UI.SidebarGroup></UI.SidebarContent><UI.SidebarFooter className="p-2">Footer</UI.SidebarFooter></UI.Sidebar><main className="p-4"><UI.SidebarTrigger /> Content</main></UI.SidebarProvider>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
