import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const meta = {
  title: 'Components/Layout & Navigation/Tabs',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Tabs defaultValue="account" className="w-80"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account">Account settings.</TabsContent><TabsContent value="password">Password settings.</TabsContent></Tabs>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
