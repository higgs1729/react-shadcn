import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CollectionGrid } from '@/components/collection-grid-01'

function CollectionGridDemo() {
  const [selectedId, setSelectedId] = React.useState('1')

  return (
    <CollectionGrid
      items={[
        { id: '1', title: 'Brand guidelines', description: 'Logo, color, and type system.', badge: 'Design' },
        { id: '2', title: 'Q3 roadmap', description: 'Planned features for Q3.', badge: 'Planning' },
        { id: '3', title: 'Onboarding kit', description: 'New hire welcome materials.', badge: 'HR' },
      ]}
      selectedId={selectedId}
      onItemSelect={setSelectedId}
    />
  )
}

const meta = {
  title: 'Blocks/collection-grid/Collection Grid 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <CollectionGridDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
