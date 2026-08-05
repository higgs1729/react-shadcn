"use client"

// Route: /studio/result

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { SectionCards } from "@/components/blocks/section-cards"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@react-shadcn/shadcn-kit/ui/card"
import { studioEvidence } from "@/lib/studio-portfolio/evidence"
import { PageFrame } from "./studio-page-shell"

export function ResultReportPage() {
  return (
    <PageFrame
      title="Result report"
      description="承認したflowのSelectionSpecとBuildReportを、ChildRouteとして確認します。"
    >
      <SectionCards
        items={[
          {
            label: "Resolved steps",
            value: String(studioEvidence.selections.length),
            summary: "SelectionSpecの解決済みstep",
            detail: "studio-portfolio-01",
          },
          {
            label: "Built screens",
            value: String(studioEvidence.build.screens),
            summary: "BuildReportの作成画面",
            detail: "Historical evidence",
          },
          {
            label: "Unresolved",
            value: String(studioEvidence.build.unresolved),
            summary: "BuildReportの未解決数",
            detail: "Historical evidence",
          },
          {
            label: "Checks",
            value: String(studioEvidence.checks.length),
            summary: "記録された自動check",
            detail: "BuildReport",
          },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>採用されたpattern</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {studioEvidence.selections.map((selection) => (
            <div key={selection.stepId} className="rounded-md border p-3">
              <p className="font-medium">{selection.stepId}</p>
              <p className="text-sm text-muted-foreground">
                {selection.pattern}
              </p>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button nativeButton={false} render={<Link href="/studio/preview" />}>
            生成previewを見る <ArrowRightIcon />
          </Button>
        </CardFooter>
      </Card>
    </PageFrame>
  )
}
