import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DocumentBodyEditor } from "@/components/document-body-editor-01"

const attachments = [
  { id: "att-1", name: "roadmap-q3.pdf", meta: "1.2 MB" },
  { id: "att-2", name: "architecture-diagram.png", meta: "480 KB" },
]

const content = `Our Q3 roadmap focuses on three pillars: reliability, onboarding speed, and self-serve billing.

Reliability work starts with tightening our incident response runbook and adding synthetic monitors to the top five customer flows.

Onboarding speed depends on collapsing the current seven-step setup wizard into three guided steps, backed by sensible defaults.`

const meta = {
  title: "Blocks/document-body-editor/Document Body Editor 01",
  component: DocumentBodyEditor,
  args: {
    title: "Q3 Product Roadmap",
    content,
    attachments,
    savedState: "saved",
    onTitleChange: () => undefined,
    onContentChange: () => undefined,
  },
} satisfies Meta<typeof DocumentBodyEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    title: "",
    content: "",
    attachments: [],
    savedState: "unsaved",
  },
}
