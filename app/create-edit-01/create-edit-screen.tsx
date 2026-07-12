"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ActionFooter } from "@/components/action-footer-01"
import { FileUploadArea, type FileUploadAreaFile } from "@/components/file-upload-area-01"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import recordData from "./data.json"

export type CreateEditState = "default" | "loading" | "empty" | "error"

interface EditableRecord {
  name: string
  owner: string
  summary: string
  attachments: { id: string; name: string; size: string }[]
}

const RECORD = recordData.record as EditableRecord

export function CreateEditScreen({
  state = "default",
}: {
  state?: CreateEditState
}) {
  const [name, setName] = React.useState(RECORD.name)
  const [owner, setOwner] = React.useState(RECORD.owner)
  const [summary, setSummary] = React.useState(RECORD.summary)
  const [files, setFiles] = React.useState<FileUploadAreaFile[]>(
    RECORD.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      state: "done" as const,
    }))
  )
  const [dirty, setDirty] = React.useState(false)

  function markDirty<T>(setter: (value: T) => void) {
    return (value: T) => {
      setDirty(true)
      setter(value)
    }
  }

  function addFiles(fileList: FileList) {
    const added: FileUploadAreaFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      state: "done" as const,
    }))
    setDirty(true)
    setFiles((current) => [...current, ...added])
  }

  function removeFile(id: string) {
    setDirty(true)
    setFiles((current) => current.filter((f) => f.id !== id))
  }

  return (
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 md:p-6">
          <div>
            <h1 className="text-xl font-semibold">Edit plan</h1>
            <p className="text-sm text-muted-foreground">
              Update the plan details and attachments.
            </p>
          </div>

          {state === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t load this record</AlertTitle>
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
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {state === "empty" && (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              Start from a blank plan — no fields have been filled in yet.
            </div>
          )}

          {state === "default" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Plan details</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="plan-name">Name</FieldLabel>
                      <Input
                        id="plan-name"
                        value={name}
                        onChange={(e) => markDirty(setName)(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="plan-owner">Owner</FieldLabel>
                      <Input
                        id="plan-owner"
                        value={owner}
                        onChange={(e) => markDirty(setOwner)(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="plan-summary">Summary</FieldLabel>
                      <Textarea
                        id="plan-summary"
                        value={summary}
                        onChange={(e) => markDirty(setSummary)(e.target.value)}
                      />
                      <FieldDescription>
                        A short description shown in the plan list.
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Attachments</FieldLabel>
                      <FileUploadArea
                        files={files}
                        onFilesSelected={addFiles}
                        onRemoveFile={removeFile}
                        onDrop={(event) => addFiles(event.dataTransfer.files)}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              <ActionFooter
                primaryLabel="Save changes"
                secondaryLabel="Cancel"
                onPrimaryAction={() => setDirty(false)}
                onSecondaryAction={() => setDirty(false)}
                primaryDisabled={!dirty}
              />
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
