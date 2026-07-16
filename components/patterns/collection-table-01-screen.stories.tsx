import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CollectionTableScreen } from '@/app/(system)/collection-01/collection-screen'

const meta = {
  title: 'Patterns/collection/Collection Table 01',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CollectionTableScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <CollectionTableScreen state="default" />,
}

export const Loading: Story = {
  render: () => <CollectionTableScreen state="loading" />,
}

export const Empty: Story = {
  render: () => <CollectionTableScreen state="empty" />,
}

export const Error: Story = {
  render: () => <CollectionTableScreen state="error" />,
}
