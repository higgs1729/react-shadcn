"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

export interface DetailOverviewField {
  id: string
  label: string
  value: string
}

export interface DetailOverviewProps {
  title: string
  status: string
  statusVariant?: "default" | "secondary" | "destructive" | "outline"
  fields: DetailOverviewField[]
}

export function DetailOverview({
  title,
  status,
  statusVariant = "secondary",
  fields,
}: DetailOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant={statusVariant}>{status}</Badge>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4">
        {fields.map((field) => (
          <Field key={field.id} orientation="horizontal">
            <FieldLabel className="text-muted-foreground">
              {field.label}
            </FieldLabel>
            <FieldContent className="items-end text-right">
              {field.value}
            </FieldContent>
          </Field>
        ))}
      </CardContent>
    </Card>
  )
}
