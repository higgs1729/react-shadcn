"use client"

import { FileIcon, UploadIcon, XIcon } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"

export interface FileUploadAreaFile {
  id: string
  name: string
  size: string
  state: "idle" | "uploading" | "processing" | "error" | "done"
}

export interface FileUploadAreaProps {
  files: FileUploadAreaFile[]
  onFilesSelected: (fileList: FileList) => void
  onRemoveFile: (id: string) => void
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
}

export function FileUploadArea({
  files,
  onFilesSelected,
  onRemoveFile,
  onDrop,
}: FileUploadAreaProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onDrop?.(e)
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center"
      >
        <UploadIcon className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground">
          or choose files from your device
        </p>
        <Button variant="outline" size="sm" render={<label />}>
          Browse files
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) onFilesSelected(e.target.files)
            }}
          />
        </Button>
      </div>
      {files.length > 0 && (
        <AttachmentGroup className="flex-wrap">
          {files.map((file) => (
            <Attachment key={file.id} state={file.state} orientation="horizontal">
              <AttachmentMedia>
                <FileIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{file.name}</AttachmentTitle>
                <AttachmentDescription>{file.size}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemoveFile(file.id)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>
      )}
    </div>
  )
}
