import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ConversationTriageList } from "@/components/blocks/conversation-triage-list-01"

const conversations = [
  { id: "conv-101", sender: "Maya Chen", subject: "Unable to update billing address", preview: "The save button stays disabled after I edit the address.", status: "open" as const, priority: "high" as const, assignee: "Ari", updated: "2m" },
  { id: "conv-102", sender: "Jon Bell", subject: "Question about SSO rollout", preview: "Can we enable SAML for one workspace before the others?", status: "open" as const, priority: "normal" as const, assignee: "Unassigned", updated: "14m" },
  { id: "conv-103", sender: "Priya Shah", subject: "Import completed with warnings", preview: "Three records were skipped and I need help understanding why.", status: "snoozed" as const, priority: "normal" as const, assignee: "Noah", updated: "1h" },
]

const meta = {
  title: "Blocks/conversation-triage-list/Conversation Triage List 01",
  component: ConversationTriageList,
  args: {
    conversations,
    activeConversationId: "conv-101",
    onSelectConversation: () => undefined,
    onAssignConversation: () => undefined,
    onSnoozeConversation: () => undefined,
    onCloseConversation: () => undefined,
  },
} satisfies Meta<typeof ConversationTriageList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
