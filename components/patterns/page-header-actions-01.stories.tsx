import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SiteHeader } from '@/components/site-header'
import { SidebarProvider } from '@/components/ui/sidebar'

const meta = {
  title: 'Blocks/page-header-actions/Page Header Actions 01',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  render: () => (
    <SidebarProvider><SiteHeader /></SidebarProvider>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
