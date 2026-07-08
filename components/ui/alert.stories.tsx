import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

const meta = {
  title: 'Components/Feedback & Status/Alert',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: () => (
    <Alert className="max-w-md"><AlertTitle>Heads up!</AlertTitle><AlertDescription>You can add components to your app using the CLI.</AlertDescription></Alert>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
