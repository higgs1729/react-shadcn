"use client"

import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Field,
  FieldContent,
  FieldLabel,
} from "@react-shadcn/shadcn-kit/ui/field"
import { Input } from "@react-shadcn/shadcn-kit/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@react-shadcn/shadcn-kit/ui/sheet"

export interface DrawerInspectorField {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
}

export interface DrawerInspector01Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: DrawerInspectorField[]
  onSave: () => void
}

export function DrawerInspector01({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSave,
}: DrawerInspector01Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          {fields.map((field) => (
            <Field key={field.id}>
              <FieldLabel htmlFor={`drawer-inspector-01-${field.id}`}>
                {field.label}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`drawer-inspector-01-${field.id}`}
                  value={field.value}
                  onChange={(e) => field.onValueChange(e.target.value)}
                />
              </FieldContent>
            </Field>
          ))}
        </div>
        <SheetFooter>
          <Button onClick={onSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
