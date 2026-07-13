"use client"

import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export interface SettingsSectionRow {
  id: string
  label: string
  description: string
  checked: boolean
}

export interface SettingsSectionProps {
  title: string
  description: string
  settings: SettingsSectionRow[]
  onToggle: (id: string, checked: boolean) => void
  children?: ReactNode
  borderless?: boolean
}

export function SettingsSection({
  title,
  description,
  settings,
  onToggle,
  children,
  borderless = false,
}: SettingsSectionProps) {
  const rows = settings.map((setting) => (
    <Field key={setting.id} orientation="horizontal" className="border-t py-4">
      <FieldLabel htmlFor={`setting-${setting.id}`}>
        <FieldContent>
          <span>{setting.label}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {setting.description}
          </span>
        </FieldContent>
        <Switch
          id={`setting-${setting.id}`}
          checked={setting.checked}
          onCheckedChange={(checked) => onToggle(setting.id, checked)}
        />
      </FieldLabel>
    </Field>
  ))

  if (borderless) {
    return (
      <section>
        <div className="pb-5">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col">
          {rows}
          {children}
        </div>
      </section>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        {rows}
        {children}
      </CardContent>
    </Card>
  )
}
