import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LoadingSkeleton01 } from '@/components/blocks/loading-skeleton-01'

function LoadingSkeleton01Demo() {
  return <LoadingSkeleton01 rows={4} />
}

const meta = {
  title: 'Blocks/loading-skeleton/Loading Skeleton 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <LoadingSkeleton01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
