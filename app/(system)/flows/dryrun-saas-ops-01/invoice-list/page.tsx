"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import {
  CollectionTableScreen,
  type CollectionState,
} from "@/app/(system)/collection-01/collection-screen"

const STATES: readonly CollectionState[] = ["default", "loading", "empty", "error"]

function resolveState(raw: string | null): CollectionState {
  return STATES.includes(raw as CollectionState) ? (raw as CollectionState) : "default"
}

// The invoice-list step's stateCoveragePlan (default/loading/empty/error) is
// reachable through the route via `?state=`; an absent or unrecognized value
// falls back to "default". Read client-side so the route stays statically
// exportable (a Server Component `await searchParams` forces dynamic rendering).
function InvoiceListStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <CollectionTableScreen state={state} />
}

export default function InvoiceListPage() {
  return (
    <React.Suspense fallback={<CollectionTableScreen state="loading" />}>
      <InvoiceListStateReader />
    </React.Suspense>
  )
}
