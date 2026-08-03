"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface ModalDialog01Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  label: string
  value: string
  onValueChange: (value: string) => void
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
}

export function ModalDialog01({
  open,
  onOpenChange,
  title,
  description,
  label,
  value,
  onValueChange,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  onConfirm,
}: ModalDialog01Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="modal-dialog-01-input">{label}</FieldLabel>
          <FieldContent>
            <Input
              id="modal-dialog-01-input"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
            />
          </FieldContent>
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
