"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DetailScreen, type DetailState } from "@/app/detail-01/detail-screen"

// contract-explorer's stateCoveragePlan is [default, loading, empty], reachable via `?state=`.
const STATES: readonly DetailState[] = ["default", "loading", "empty"]

function resolveState(raw: string | null): DetailState {
  return STATES.includes(raw as DetailState) ? (raw as DetailState) : "default"
}

function ContractExplorerStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <DetailScreen state={state} />
}

export default function ContractExplorerPage() {
  return (
    <React.Suspense fallback={<DetailScreen state="loading" />}>
      <ContractExplorerStateReader />
    </React.Suspense>
  )
}
