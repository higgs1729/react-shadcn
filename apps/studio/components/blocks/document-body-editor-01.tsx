"use client"

import { PaperclipIcon } from "lucide-react"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@react-shadcn/shadcn-kit/ui/attachment"
import { Badge } from "@react-shadcn/shadcn-kit/ui/badge"
import { Card, CardContent, CardHeader } from "@react-shadcn/shadcn-kit/ui/card"
import { Field, FieldContent, FieldError, FieldLabel } from "@react-shadcn/shadcn-kit/ui/field"
import { Input } from "@react-shadcn/shadcn-kit/ui/input"
import { ScrollArea } from "@react-shadcn/shadcn-kit/ui/scroll-area"
import { Textarea } from "@react-shadcn/shadcn-kit/ui/textarea"

export type DocumentBodyEditorSavedState = "saved" | "saving" | "unsaved"

export interface DocumentBodyEditorAttachment {
  id: string
  name: string
  meta: string
}

export interface DocumentBodyEditorProps {
  title: string
  onTitleChange?: (title: string) => void
  content: string
  onContentChange: (content: string) => void
  attachments?: DocumentBodyEditorAttachment[]
  savedState?: DocumentBodyEditorSavedState
  emptyPlaceholder?: string
  titleError?: string
}

const savedStateLabel: Record<DocumentBodyEditorSavedState, string> = {
  saved: "Saved",
  saving: "Saving…",
  unsaved: "Unsaved changes",
}

const savedStateVariant: Record<
  DocumentBodyEditorSavedState,
  "outline" | "secondary" | "destructive"
> = {
  saved: "outline",
  saving: "secondary",
  unsaved: "destructive",
}

export function DocumentBodyEditor({
  title,
  onTitleChange,
  content,
  onContentChange,
  attachments = [],
  savedState = "saved",
  emptyPlaceholder = "Start writing…",
  titleError,
}: DocumentBodyEditorProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2">
          <Field className="flex-1" data-invalid={Boolean(titleError) || undefined}>
            <FieldLabel htmlFor="document-body-editor-title" className="sr-only">
              Document title
            </FieldLabel>
            <Input
              id="document-body-editor-title"
              aria-describedby={titleError ? "document-body-editor-title-error" : undefined}
              aria-invalid={Boolean(titleError) || undefined}
              value={title}
              placeholder="Untitled document"
              onChange={(event) => onTitleChange?.(event.target.value)}
              className="border-none px-0 text-lg font-medium shadow-none focus-visible:ring-0"
            />
            {titleError && (
              <FieldError id="document-body-editor-title-error">{titleError}</FieldError>
            )}
          </Field>
          <Badge variant={savedStateVariant[savedState]}>
            {savedStateLabel[savedState]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="gap-4">
        <Field>
          <FieldContent>
            <Textarea
              aria-label="Document body"
              value={content}
              placeholder={emptyPlaceholder}
              onChange={(event) => onContentChange(event.target.value)}
              className="min-h-64 resize-none border-none px-0 shadow-none focus-visible:ring-0"
            />
          </FieldContent>
        </Field>
        {attachments.length > 0 && (
          <ScrollArea>
            <AttachmentGroup>
              {attachments.map((attachment) => (
                <Attachment key={attachment.id}>
                  <AttachmentMedia>
                    <PaperclipIcon />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{attachment.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {attachment.meta}
                    </AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              ))}
            </AttachmentGroup>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
