"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ActionFooter } from "@/components/blocks/action-footer-01"
import { AppSidebar } from "@/components/blocks/app-sidebar"
import { BreadcrumbContext01 } from "@/components/blocks/breadcrumb-context-01"
import { SettingsSection, type SettingsSectionRow } from "@/components/blocks/settings-section-01"
import { TabsViewSwitcher01 } from "@/components/blocks/tabs-view-switcher-01"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import settingsData from "./data.json"

export type SettingsAdminState = "default" | "loading" | "empty" | "error"

const BREADCRUMB_PATH = settingsData.breadcrumbPath as string[]
const PROFILE = settingsData.profile as { name: string; email: string; role: string }

export function SettingsAdminScreen({
  state = "default",
}: {
  state?: SettingsAdminState
}) {
  const [activeTab, setActiveTab] = React.useState("general")
  const [name, setName] = React.useState(PROFILE.name)
  const [email, setEmail] = React.useState(PROFILE.email)
  const [dirty, setDirty] = React.useState(false)
  const [notifications, setNotifications] = React.useState(
    settingsData.notifications as SettingsSectionRow[]
  )
  const [security, setSecurity] = React.useState(
    settingsData.security as SettingsSectionRow[]
  )

  function toggle(
    setter: React.Dispatch<React.SetStateAction<SettingsSectionRow[]>>
  ) {
    return (id: string, checked: boolean) => {
      setDirty(true)
      setter((prev) => prev.map((s) => (s.id === id ? { ...s, checked } : s)))
    }
  }

  const generalContent = (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="profile-name">Name</FieldLabel>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => {
                setDirty(true)
                setName(e.target.value)
              }}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => {
                setDirty(true)
                setEmail(e.target.value)
              }}
            />
            <FieldDescription>Used for sign-in and notifications.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <p className="text-sm text-muted-foreground">{PROFILE.role}</p>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
          <BreadcrumbContext01
            items={BREADCRUMB_PATH.map((label) => ({
              id: label,
              label,
              onSelect: () => setActiveTab("general"),
            }))}
            currentLabel={
              activeTab === "general"
                ? "General"
                : activeTab === "notifications"
                  ? "Notifications"
                  : "Security"
            }
          />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div>
            <h1 className="text-xl font-semibold">Workspace settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile, notifications, and security policies.
            </p>
          </div>

          {state === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t load settings</AlertTitle>
              <AlertDescription>
                Check your connection and try again.
              </AlertDescription>
              <AlertAction>
                <Button variant="outline" size="sm">
                  <RotateCcwIcon />
                  Retry
                </Button>
              </AlertAction>
            </Alert>
          )}

          {state === "loading" && (
            <div className="space-y-4 rounded-lg border p-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {state === "empty" && (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              You don&apos;t have permission to manage any settings in this workspace.
            </div>
          )}

          {state === "default" && (
            <>
              <TabsViewSwitcher01
                value={activeTab}
                onValueChange={setActiveTab}
                views={[
                  { value: "general", label: "General", content: generalContent },
                  {
                    value: "notifications",
                    label: "Notifications",
                    content: (
                      <SettingsSection
                        title="Notifications"
                        description="Choose how members are notified."
                        settings={notifications}
                        onToggle={toggle(setNotifications)}
                      />
                    ),
                  },
                  {
                    value: "security",
                    label: "Security",
                    content: (
                      <SettingsSection
                        title="Security"
                        description="Workspace-wide authentication policies."
                        settings={security}
                        onToggle={toggle(setSecurity)}
                      />
                    ),
                  },
                ]}
              />

              <ActionFooter
                primaryLabel="Save changes"
                secondaryLabel="Cancel"
                onPrimaryAction={() => setDirty(false)}
                onSecondaryAction={() => setDirty(false)}
                primaryDisabled={!dirty}
              />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
