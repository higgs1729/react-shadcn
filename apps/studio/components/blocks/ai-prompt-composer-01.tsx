"use client"

import { PaperclipIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export interface AiPromptComposerProps {
  value: string
  onValueChange: (value: string) => void
  onSend: () => void
  onAttach?: () => void
  disabled?: boolean
  placeholder?: string
}

export function AiPromptComposer({
  value,
  onValueChange,
  onSend,
  onAttach,
  disabled = false,
  placeholder = "Ask anything...",
}: AiPromptComposerProps) {
  return (
    <InputGroup>
      <InputGroupTextarea
        aria-label="Prompt"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (value.trim().length > 0 && !disabled) onSend()
          }
        }}
      />
      <InputGroupAddon align="block-end">
        {onAttach && (
          <InputGroupButton
            aria-label="Attach file"
            onClick={onAttach}
            disabled={disabled}
          >
            <PaperclipIcon />
          </InputGroupButton>
        )}
        <div className="flex-1" />
        <Button
          size="icon-sm"
          aria-label="Send"
          disabled={disabled || value.trim().length === 0}
          onClick={onSend}
        >
          <SendIcon />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}
