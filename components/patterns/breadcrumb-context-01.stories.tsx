import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BreadcrumbContext01 } from '@/components/breadcrumb-context-01'

function BreadcrumbContext01Demo() {
  const [path, setPath] = React.useState(['Home', 'Projects', 'Website Redesign'])

  return (
    <BreadcrumbContext01
      items={path.slice(0, -1).map((label, index) => ({
        id: label,
        label,
        onSelect: () => setPath(path.slice(0, index + 1)),
      }))}
      currentLabel={path[path.length - 1]}
    />
  )
}

const meta = {
  title: 'Blocks/breadcrumb-context/Breadcrumb Context 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <BreadcrumbContext01Demo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
