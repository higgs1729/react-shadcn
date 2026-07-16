import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  FileUploadArea,
  type FileUploadAreaFile,
} from '@/components/blocks/file-upload-area-01'

function FileUploadAreaDemo() {
  const [files, setFiles] = React.useState<FileUploadAreaFile[]>([
    { id: '1', name: 'brand-guidelines.pdf', size: '2.1 MB', state: 'done' },
    { id: '2', name: 'hero-image.png', size: '840 KB', state: 'uploading' },
  ])

  return (
    <FileUploadArea
      files={files}
      onFilesSelected={(fileList) => {
        const added: FileUploadAreaFile[] = Array.from(fileList).map((file, i) => ({
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
          state: 'idle',
        }))
        setFiles((prev) => [...prev, ...added])
      }}
      onRemoveFile={(id) =>
        setFiles((prev) => prev.filter((file) => file.id !== id))
      }
      onDrop={(event) => {
        const dropped = event.dataTransfer?.files
        if (dropped && dropped.length > 0) {
          const added: FileUploadAreaFile[] = Array.from(dropped).map((file, i) => ({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            state: 'idle',
          }))
          setFiles((prev) => [...prev, ...added])
        }
      }}
    />
  )
}

const meta = {
  title: 'Blocks/file-upload-area/File Upload Area 01',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: () => <FileUploadAreaDemo />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
