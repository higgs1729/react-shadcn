import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const meta = {
  title: 'Components/Data Display/Card',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Card className="w-80"><CardHeader><CardTitle>Card title</CardTitle><CardDescription>Card description</CardDescription></CardHeader><CardContent>Card content goes here.</CardContent><CardFooter>Footer</CardFooter></Card>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
