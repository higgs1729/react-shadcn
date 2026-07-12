"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DashboardScreen, type DashboardState } from "@/app/dashboard-01/dashboard-screen"

// overview's stateCoveragePlan is [default, loading], reachable via `?state=`.
const STATES: readonly DashboardState[] = ["default", "loading"]

function resolveState(raw: string | null): DashboardState {
  return STATES.includes(raw as DashboardState) ? (raw as DashboardState) : "default"
}

function OverviewStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <DashboardScreen state={state} />
}

export default function OverviewPage() {
  return (
    <React.Suspense fallback={<DashboardScreen state="loading" />}>
      <OverviewStateReader />
    </React.Suspense>
  )
}
