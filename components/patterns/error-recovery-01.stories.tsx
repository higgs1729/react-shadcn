import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ErrorRecovery01 } from '@/components/blocks/error-recovery-01'

function ErrorRecovery01Demo() {
  const [retryCount, setRetryCount] = React.useState(0)

  return (
    <div className="flex flex-col items-center gap-2">
      <ErrorRecovery01
        title="Something went wrong"
        description="We couldn't load this page. Check your connection and try again."
        retryLabel="Retry"
        onRetry={() => setRetryCount((count) => count + 1)}
      />
      <p className="text-sm text-muted-foreground">Retries: {retryCount}</p>
    </div>
  )
}

const meta = {
  title: 'Blocks/error-recovery/Error Recovery 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <ErrorRecovery01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
