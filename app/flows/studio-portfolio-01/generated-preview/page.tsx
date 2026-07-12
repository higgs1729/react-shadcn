"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DetailScreen, type DetailState } from "@/app/detail-01/detail-screen"

// generated-preview's stateCoveragePlan is [default, loading, empty, error], reachable via `?state=`.
const STATES: readonly DetailState[] = ["default", "loading", "empty", "error"]

function resolveState(raw: string | null): DetailState {
  return STATES.includes(raw as DetailState) ? (raw as DetailState) : "default"
}

function GeneratedPreviewStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <DetailScreen state={state} />
}

export default function GeneratedPreviewPage() {
  return (
    <React.Suspense fallback={<DetailScreen state="loading" />}>
      <GeneratedPreviewStateReader />
    </React.Suspense>
  )
}
