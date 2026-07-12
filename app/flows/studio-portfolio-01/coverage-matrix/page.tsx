"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DashboardScreen, type DashboardState } from "@/app/dashboard-01/dashboard-screen"

// coverage-matrix's stateCoveragePlan is [default, loading], reachable via `?state=`.
const STATES: readonly DashboardState[] = ["default", "loading"]

function resolveState(raw: string | null): DashboardState {
  return STATES.includes(raw as DashboardState) ? (raw as DashboardState) : "default"
}

function CoverageMatrixStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <DashboardScreen state={state} />
}

export default function CoverageMatrixPage() {
  return (
    <React.Suspense fallback={<DashboardScreen state="loading" />}>
      <CoverageMatrixStateReader />
    </React.Suspense>
  )
}
