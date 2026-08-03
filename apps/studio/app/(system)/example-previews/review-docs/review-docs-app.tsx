"use client"

import * as React from "react"
import { FileTextIcon, FolderIcon, Trash2Icon, UndoIcon } from "lucide-react"

import { BreadcrumbContext01 } from "@/components/blocks/breadcrumb-context-01"
import { CommentThread, type CommentThreadComment } from "@/components/blocks/comment-thread-01"
import { DocumentBodyEditor } from "@/components/blocks/document-body-editor-01"
import { FileUploadArea, type FileUploadAreaFile } from "@/components/blocks/file-upload-area-01"
import { Button } from "@/components/ui/button"

type SavedState = "saved" | "saving" | "unsaved"

const STORAGE_KEY = "studio-example:review-docs"

// Every value below is local seed state. No document store or review
// service is connected; Save persists this snapshot to the browser's own
// localStorage only, so it survives a reload of this tab but nothing else.
const SEED_TITLE = "Q3 Launch Readiness Plan"
const SEED_CONTENT = `## Launch summary

The 3.0 release ships the new billing pipeline, localized onboarding, and the redesigned status page.

## Open risks
- Billing cutover needs a final load test before the freeze.
- Localization QA is pending for two locales.

## Rollout
Staged rollout begins Monday behind the release flag, expanding to all workspaces by Thursday.`

const SEED_BREADCRUMB = ["Workspace", "Launches", "3.0 Release"]

const SEED_COMMENTS: CommentThreadComment[] = [
  { id: "comment-1", author: "Maya Chen", body: "Can we add the rollback trigger to the rollout section?", timestamp: "2 hours ago" },
  { id: "comment-2", author: "Jordan Lee", body: "Load test is scheduled for Friday — I'll update the risk once it passes.", timestamp: "1 hour ago" },
]

const SEED_ATTACHMENTS = [
  { id: "att-1", name: "load-test-plan.pdf", meta: "220 KB" },
  { id: "att-2", name: "rollout-timeline.png", meta: "88 KB" },
]

type Snapshot = {
  title: string
  content: string
  comments: CommentThreadComment[]
  files: FileUploadAreaFile[]
}

const SEED_SNAPSHOT: Snapshot = {
  title: SEED_TITLE,
  content: SEED_CONTENT,
  comments: SEED_COMMENTS,
  files: SEED_ATTACHMENTS.map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    size: attachment.meta,
    state: "done" as const,
  })),
}

function readSnapshot(): Snapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.title === "string" &&
      typeof parsed?.content === "string" &&
      Array.isArray(parsed?.comments) &&
      Array.isArray(parsed?.files)
    ) {
      return parsed as Snapshot
    }
    return null
  } catch {
    return null
  }
}

function writeSnapshot(snapshot: Snapshot) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Storage may throw inside a sandboxed iframe or private-browsing mode;
    // the document still works for the current render, it just won't persist.
  }
}

export function ReviewDocsApp() {
  // title, content, comments, and files are kept as one snapshot object so
  // restoring a saved document (on mount) or the last save (on Discard) is a
  // single state update rather than several sequential ones.
  const [doc, setDoc] = React.useState<Snapshot>(SEED_SNAPSHOT)
  const [reply, setReply] = React.useState("")
  const [savedState, setSavedState] = React.useState<SavedState>("saved")
  const [breadcrumbPath, setBreadcrumbPath] = React.useState(SEED_BREADCRUMB)
  const lastSaved = React.useRef<Snapshot>(SEED_SNAPSHOT)

  React.useEffect(() => {
    const stored = readSnapshot()
    if (stored) {
      // Reading localStorage must happen after mount; there is no lazy-init
      // alternative that avoids an SSR/client markup mismatch here.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, not derived render state
      setDoc(stored)
      lastSaved.current = stored
    }
  }, [])

  const { title, content, comments, files } = doc

  function editTitle(value: string) {
    setDoc((current) => ({ ...current, title: value }))
    setSavedState("unsaved")
  }

  function editContent(value: string) {
    setDoc((current) => ({ ...current, content: value }))
    setSavedState("unsaved")
  }

  function save() {
    writeSnapshot(doc)
    lastSaved.current = doc
    setSavedState("saved")
  }

  function discard() {
    setDoc(lastSaved.current)
    setSavedState("saved")
  }

  function submitReply() {
    if (!reply.trim()) return
    setDoc((current) => ({
      ...current,
      comments: [...current.comments, { id: `comment-${Date.now()}`, author: "You", body: reply, timestamp: "Just now" }],
    }))
    setReply("")
    setSavedState("unsaved")
  }

  function deleteComment(id: string) {
    setDoc((current) => ({ ...current, comments: current.comments.filter((comment) => comment.id !== id) }))
    setSavedState("unsaved")
  }

  function addFiles(fileList: FileList) {
    const added: FileUploadAreaFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      state: "done" as const,
    }))
    setDoc((current) => ({ ...current, files: [...current.files, ...added] }))
    setSavedState("unsaved")
  }

  function removeFile(id: string) {
    setDoc((current) => ({ ...current, files: current.files.filter((file) => file.id !== id) }))
    setSavedState("unsaved")
  }

  // Attachments shown inside the editor mirror the local file list.
  const editorAttachments = files.map((file) => ({ id: file.id, name: file.name, meta: file.size }))

  return (
    <div className="min-h-dvh bg-muted/30 text-foreground">
      <div className="flex min-h-dvh">
        <aside className="hidden w-52 shrink-0 flex-col border-r bg-background p-3 md:flex">
          <div className="mb-7 flex items-center gap-2 px-2 text-sm font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <FileTextIcon className="size-4" />
            </span>
            Review Docs
          </div>
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Launch docs
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-2 text-sm font-medium text-foreground">
              <FileTextIcon className="size-4" aria-hidden="true" />
              <span className="truncate">{title || "Untitled document"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground">
              <FolderIcon className="size-4" aria-hidden="true" />
              Archived docs
            </div>
          </div>
          <p className="mt-auto px-2 pt-10 text-xs leading-relaxed text-muted-foreground">
            Static portfolio example
            <br />
            Saved to this browser only
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-14 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
            <BreadcrumbContext01
              items={breadcrumbPath.map((label, index) => ({
                id: label,
                label,
                onSelect: () => setBreadcrumbPath(breadcrumbPath.slice(0, index + 1)),
              }))}
              currentLabel={title || "Untitled document"}
            />
            <div className="flex items-center gap-2">
              {savedState === "unsaved" && (
                <Button size="sm" variant="ghost" onClick={discard}>
                  <UndoIcon data-icon="inline-start" />
                  Discard changes
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={save} disabled={savedState === "saved"}>
                {savedState === "saved" ? "Saved" : "Save"}
              </Button>
              <Button size="sm">Share</Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <h1 className="sr-only">Review document workspace</h1>
            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
              <DocumentBodyEditor
                title={title}
                onTitleChange={editTitle}
                content={content}
                onContentChange={editContent}
                attachments={editorAttachments}
                savedState={savedState}
                titleError={title.trim() ? undefined : "Enter a document title."}
              />
              <div className="flex min-w-0 flex-col gap-4">
                <CommentThread
                  comments={comments}
                  replyValue={reply}
                  onReplyChange={setReply}
                  onSubmitReply={submitReply}
                />
                {comments.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <h2 className="mb-2 text-xs font-medium text-muted-foreground">Manage comments</h2>
                    <div className="divide-y">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex items-center gap-2 py-1.5 text-xs">
                          <span className="min-w-0 flex-1 truncate">
                            <span className="font-medium">{comment.author}:</span> {comment.body}
                          </span>
                          <Button
                            aria-label={`Delete comment from ${comment.author}`}
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-lg border p-4">
                  <h2 className="mb-3 text-sm font-medium">Attachments</h2>
                  <FileUploadArea
                    files={files}
                    onFilesSelected={addFiles}
                    onRemoveFile={removeFile}
                    onDrop={(event) => addFiles(event.dataTransfer.files)}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
