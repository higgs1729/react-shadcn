"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { ActionFooter } from "@/components/blocks/action-footer-01"
import { ActivityFeed, type ActivityFeedEntry } from "@/components/blocks/activity-feed-01"
import { BreadcrumbContext01 } from "@/components/blocks/breadcrumb-context-01"
import { CommentThread, type CommentThreadComment } from "@/components/blocks/comment-thread-01"
import { DetailOverview, type DetailOverviewField } from "@/components/blocks/detail-overview-01"
import { SiteHeader } from "@/components/blocks/site-header"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import detailData from "./data.json"

export type DetailState = "default" | "loading" | "empty" | "error"

interface DetailRecord {
  title: string
  status: string
  statusVariant: "default" | "secondary" | "destructive" | "outline"
  fields: DetailOverviewField[]
}

const RECORD = detailData.record as DetailRecord
const BREADCRUMB_PATH = detailData.breadcrumbPath as string[]
const ACTIVITY = detailData.activity as ActivityFeedEntry[]
const INITIAL_COMMENTS = detailData.comments as CommentThreadComment[]

export function DetailScreen({
  state = "default",
}: {
  state?: DetailState
}) {
  const [breadcrumbPath, setBreadcrumbPath] = React.useState(BREADCRUMB_PATH)
  const [comments, setComments] = React.useState(INITIAL_COMMENTS)
  const [reply, setReply] = React.useState("")

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

  return (
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <BreadcrumbContext01
              items={breadcrumbPath.map((label, index) => ({
                id: label,
                label,
                onSelect: () => setBreadcrumbPath(BREADCRUMB_PATH.slice(0, index + 1)),
              }))}
              currentLabel={RECORD.title}
            />
            <Button size="sm" variant="outline">
              Edit
            </Button>
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
            <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
              <div className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          )}

          {state === "empty" && (
            <Empty className="rounded-lg border">
              <EmptyHeader>
                <EmptyTitle>Record not found</EmptyTitle>
                <EmptyDescription>
                  This invoice may have been deleted or you may not have access.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline">Back to invoices</Button>
              </EmptyContent>
            </Empty>
          )}

          {state === "default" && (
            <>
              <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
                <div className="flex min-w-0 flex-col gap-4">
                  <DetailOverview
                    title={RECORD.title}
                    status={RECORD.status}
                    statusVariant={RECORD.statusVariant}
                    fields={RECORD.fields}
                  />
                  <CommentThread
                    comments={comments}
                    replyValue={reply}
                    onReplyChange={setReply}
                    onSubmitReply={submitReply}
                  />
                </div>
                <div className="rounded-lg border p-4">
                  <h2 className="mb-3 text-sm font-medium">Activity</h2>
                  <ActivityFeed entries={ACTIVITY} />
                </div>
              </div>
              <ActionFooter
                primaryLabel="Approve"
                secondaryLabel="Reject"
                onPrimaryAction={() => {}}
                onSecondaryAction={() => {}}
              />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
