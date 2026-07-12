"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DashboardScreen, type DashboardState } from "@/app/dashboard-01/dashboard-screen"

// live-demo's stateCoveragePlan is [default, loading, empty, error], reachable via `?state=`.
const STATES: readonly DashboardState[] = ["default", "loading", "empty", "error"]

function resolveState(raw: string | null): DashboardState {
  return STATES.includes(raw as DashboardState) ? (raw as DashboardState) : "default"
}

function LiveDemoStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <DashboardScreen state={state} />
}

export default function LiveDemoPage() {
  return (
    <React.Suspense fallback={<DashboardScreen state="loading" />}>
      <LiveDemoStateReader />
    </React.Suspense>
  )
}
