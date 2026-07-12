"use client"

import * as React from "react"
import { FileTextIcon, FolderIcon, RotateCcwIcon } from "lucide-react"

import { BreadcrumbContext01 } from "@/components/breadcrumb-context-01"
import { CommentThread, type CommentThreadComment } from "@/components/comment-thread-01"
import { DocumentBodyEditor } from "@/components/document-body-editor-01"
import { FileUploadArea, type FileUploadAreaFile } from "@/components/file-upload-area-01"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

import workspaceData from "./data.json"

export type DocumentWorkspaceState = "default" | "loading" | "empty" | "error"

interface WorkspaceDocument {
  id: string
  title: string
  content: string
  savedState: "saved" | "saving" | "unsaved"
}

interface WorkspaceAttachment {
  id: string
  name: string
  meta: string
}

const INITIAL_DOCUMENT = workspaceData.document as WorkspaceDocument
const BREADCRUMB_PATH = workspaceData.breadcrumbPath as string[]
const INITIAL_ATTACHMENTS = workspaceData.attachments as WorkspaceAttachment[]
const INITIAL_COMMENTS = workspaceData.comments as CommentThreadComment[]

export function DocumentWorkspaceScreen({
  state = "default",
}: {
  state?: DocumentWorkspaceState
}) {
  const [title, setTitle] = React.useState(INITIAL_DOCUMENT.title)
  const [content, setContent] = React.useState(INITIAL_DOCUMENT.content)
  const [comments, setComments] = React.useState(INITIAL_COMMENTS)
  const [reply, setReply] = React.useState("")
  const [files, setFiles] = React.useState<FileUploadAreaFile[]>(
    INITIAL_ATTACHMENTS.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      size: attachment.meta,
      state: "done" as const,
    }))
  )
  const [breadcrumbPath, setBreadcrumbPath] = React.useState(BREADCRUMB_PATH)

  function addFiles(fileList: FileList) {
    const added: FileUploadAreaFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      state: "done" as const,
    }))
    setFiles((current) => [...current, ...added])
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id))
  }

  function submitReply() {
    if (!reply.trim()) return
    setComments((current) => [
      ...current,
      {
        id: `comment-${current.length + 1}`,
        author: "You",
        body: reply,
        timestamp: "Just now",
      },
    ])
    setReply("")
  }

  const isEmptyDocument = state === "empty" || (state === "default" && content.trim().length === 0)

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Migration Docs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Q3 Platform Migration Plan">
                    <FileTextIcon />
                    <span>Q3 Platform Migration Plan</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Archived docs">
                    <FolderIcon />
                    <span>Archived docs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <BreadcrumbContext01
              items={breadcrumbPath.map((label, index) => ({
                id: label,
                label,
                onSelect: () => setBreadcrumbPath(breadcrumbPath.slice(0, index + 1)),
              }))}
              currentLabel={title || "Untitled document"}
            />
            <Button size="sm">Share</Button>
          </div>

          {state === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t load this document</AlertTitle>
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
            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
              <div className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          )}

          {isEmptyDocument && (
            <Empty className="rounded-lg border">
              <EmptyHeader>
                <EmptyTitle>This document is empty</EmptyTitle>
                <EmptyDescription>
                  Start writing to create the first version of this document.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => setContent("Start writing…")}
                >
                  Start writing
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {state === "default" && !isEmptyDocument && (
            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
              <DocumentBodyEditor
                title={title}
                onTitleChange={setTitle}
                content={content}
                onContentChange={setContent}
                attachments={INITIAL_ATTACHMENTS}
                savedState={INITIAL_DOCUMENT.savedState}
              />
              <div className="flex min-w-0 flex-col gap-4">
                <CommentThread
                  comments={comments}
                  replyValue={reply}
                  onReplyChange={setReply}
                  onSubmitReply={submitReply}
                />
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-sm font-medium">Attachments</h3>
                  <FileUploadArea
                    files={files}
                    onFilesSelected={addFiles}
                    onRemoveFile={removeFile}
                    onDrop={(event) => addFiles(event.dataTransfer.files)}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
