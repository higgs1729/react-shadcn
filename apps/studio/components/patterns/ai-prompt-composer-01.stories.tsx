import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AiPromptComposer } from '@/components/blocks/ai-prompt-composer-01'

function AiPromptComposerDemo() {
  const [value, setValue] = React.useState('')

  return (
    <AiPromptComposer
      value={value}
      onValueChange={setValue}
      onSend={() => setValue('')}
      onAttach={() => {}}
    />
  )
}

const meta = {
  title: 'Blocks/ai-prompt-composer/AI Prompt Composer 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <AiPromptComposerDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
