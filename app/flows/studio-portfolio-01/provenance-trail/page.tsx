"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ReportAnalyticsScreen, type ReportAnalyticsState } from "@/app/report-analytics-01/report-analytics-screen"

// provenance-trail's stateCoveragePlan is [default, loading, error], reachable via `?state=`.
const STATES: readonly ReportAnalyticsState[] = ["default", "loading", "error"]

function resolveState(raw: string | null): ReportAnalyticsState {
  return STATES.includes(raw as ReportAnalyticsState) ? (raw as ReportAnalyticsState) : "default"
}

function ProvenanceTrailStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <ReportAnalyticsScreen state={state} />
}

export default function ProvenanceTrailPage() {
  return (
    <React.Suspense fallback={<ReportAnalyticsScreen state="loading" />}>
      <ProvenanceTrailStateReader />
    </React.Suspense>
  )
}
