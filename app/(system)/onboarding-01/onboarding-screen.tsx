"use client"

import * as React from "react"
import { RotateCcwIcon, UsersIcon } from "lucide-react"

import { ActionFooter } from "@/components/action-footer-01"
import { EmptyState01 } from "@/components/empty-state-01"
import { FileUploadArea, type FileUploadAreaFile } from "@/components/file-upload-area-01"
import { WizardStepper, type WizardStep } from "@/components/wizard-stepper-01"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import onboardingData from "./data.json"

export type OnboardingState = "default" | "loading" | "empty" | "error"

const STEPS = onboardingData.steps as WizardStep[]
const CURRENT_STEP_ID = onboardingData.currentStepId as string
const COMPLETED_STEP_IDS = onboardingData.completedStepIds as string[]
const WORKSPACE = onboardingData.workspace as { name: string; subdomain: string }

export function OnboardingScreen({
  state = "default",
}: {
  state?: OnboardingState
}) {
  const [name, setName] = React.useState(WORKSPACE.name)
  const [subdomain, setSubdomain] = React.useState(WORKSPACE.subdomain)
  const [logo, setLogo] = React.useState<FileUploadAreaFile[]>([])
  const [invited, setInvited] = React.useState<string[]>([])

  function addLogo(fileList: FileList) {
    const [file] = Array.from(fileList)
    if (!file) return
    setLogo([
      {
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        state: "done" as const,
      },
    ])
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-xl font-semibold">Set up your workspace</h1>
        <p className="text-sm text-muted-foreground">
          A few steps to get your team ready.
        </p>
      </div>

      <WizardStepper
        steps={STEPS}
        currentStepId={CURRENT_STEP_ID}
        completedStepIds={COMPLETED_STEP_IDS}
      />

      {state === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save your progress</AlertTitle>
          <AlertDescription>
            We couldn&apos;t reach the server. Your answers are safe — try again.
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
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {state === "empty" && (
        <EmptyState01
          title="Nothing to set up yet"
          description="Your account has no workspaces. Create one to get started."
          actionLabel="Create workspace"
          onAction={() => {}}
        />
      )}

      {state === "default" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Workspace details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
                  <Input
                    id="workspace-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="workspace-subdomain">Subdomain</FieldLabel>
                  <Input
                    id="workspace-subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                  />
                  <FieldDescription>
                    {subdomain || "your-team"}.example.app
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Workspace logo</FieldLabel>
                  <FileUploadArea
                    files={logo}
                    onFilesSelected={addLogo}
                    onRemoveFile={() => setLogo([])}
                    onDrop={(event) => addLogo(event.dataTransfer.files)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {invited.length === 0 && (
            <EmptyState01
              title="No teammates invited yet"
              description="Invite people so they can collaborate in this workspace."
              actionLabel="Invite teammates"
              onAction={() => setInvited(["teammate@example.app"])}
              icon={<UsersIcon />}
            />
          )}

          <ActionFooter
            primaryLabel="Continue"
            secondaryLabel="Back"
            onPrimaryAction={() => {}}
            onSecondaryAction={() => {}}
          />
        </>
      )}
    </div>
  )
}
