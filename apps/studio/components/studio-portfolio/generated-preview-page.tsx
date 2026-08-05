"use client"

// Route: /studio/preview

import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { DetailOverview } from "@/components/blocks/detail-overview-01"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import { studioEvidence } from "@/lib/studio-portfolio/evidence"
import { PageFrame } from "./studio-page-shell"

export function GeneratedPreviewPage() {
  const preview = studioEvidence.selections.find(
    (selection) => selection.stepId === "generated-preview"
  )
  return (
    <PageFrame
      title="Generated preview"
      description="選定結果を、実際のregistry patternとStorybook artifactへ接続するためのpreviewです。"
    >
      <DetailOverview
        title={preview?.pattern ?? "No preview"}
        status="Selected"
        fields={[
          {
            id: "type",
            label: "Screen type",
            value: preview?.screenType ?? "—",
          },
          {
            id: "score",
            label: "Selection score",
            value: String(preview?.score ?? "—"),
          },
          {
            id: "blocks",
            label: "Blocks",
            value: preview?.blocks.join(", ") ?? "—",
          },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>次の確認</CardTitle>
          <CardDescription>
            PatternsでdetailとLive
            demoを開き、default/loading/empty/errorのstoryを確認します。
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button nativeButton={false} render={<Link href="/patterns" />}>
            Patternsを開く <ExternalLinkIcon />
          </Button>
        </CardFooter>
      </Card>
    </PageFrame>
  )
}
