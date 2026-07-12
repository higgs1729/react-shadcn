"use client"

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
}

export function SettingsSection({
  title,
  description,
  settings,
  onToggle,
}: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {settings.map((setting) => (
          <Field key={setting.id} orientation="horizontal">
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
        ))}
      </CardContent>
    </Card>
  )
}
