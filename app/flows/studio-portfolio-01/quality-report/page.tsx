"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ReportAnalyticsScreen, type ReportAnalyticsState } from "@/app/report-analytics-01/report-analytics-screen"

// quality-report's stateCoveragePlan is [default, loading], reachable via `?state=`.
const STATES: readonly ReportAnalyticsState[] = ["default", "loading"]

function resolveState(raw: string | null): ReportAnalyticsState {
  return STATES.includes(raw as ReportAnalyticsState) ? (raw as ReportAnalyticsState) : "default"
}

function QualityReportStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <ReportAnalyticsScreen state={state} />
}

export default function QualityReportPage() {
  return (
    <React.Suspense fallback={<ReportAnalyticsScreen state="loading" />}>
      <QualityReportStateReader />
    </React.Suspense>
  )
}
