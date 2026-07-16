"use client"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

export interface ActionFooterProps {
  primaryLabel: string
  secondaryLabel: string
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  primaryDisabled?: boolean
  secondaryDisabled?: boolean
}

export function ActionFooter({
  primaryLabel,
  secondaryLabel,
  onPrimaryAction,
  onSecondaryAction,
  primaryDisabled = false,
  secondaryDisabled = false,
}: ActionFooterProps) {
  return (
    <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
      <ButtonGroup>
        <Button
          variant="outline"
          onClick={onSecondaryAction}
          disabled={secondaryDisabled}
        >
          {secondaryLabel}
        </Button>
        <Button onClick={onPrimaryAction} disabled={primaryDisabled}>
          {primaryLabel}
        </Button>
      </ButtonGroup>
    </div>
  )
}
