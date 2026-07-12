"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ReportAnalyticsScreen, type ReportAnalyticsState } from "@/app/report-analytics-01/report-analytics-screen"

// result-report's stateCoveragePlan is [default, loading, empty], reachable via `?state=`.
const STATES: readonly ReportAnalyticsState[] = ["default", "loading", "empty"]

function resolveState(raw: string | null): ReportAnalyticsState {
  return STATES.includes(raw as ReportAnalyticsState) ? (raw as ReportAnalyticsState) : "default"
}

function ResultReportStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <ReportAnalyticsScreen state={state} />
}

export default function ResultReportPage() {
  return (
    <React.Suspense fallback={<ReportAnalyticsScreen state="loading" />}>
      <ResultReportStateReader />
    </React.Suspense>
  )
}
