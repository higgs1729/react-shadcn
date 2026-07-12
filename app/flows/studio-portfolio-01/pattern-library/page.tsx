"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { CollectionTableScreen, type CollectionState } from "@/app/collection-01/collection-screen"

// pattern-library's stateCoveragePlan is [default, loading, empty, error], reachable via `?state=`.
const STATES: readonly CollectionState[] = ["default", "loading", "empty", "error"]

function resolveState(raw: string | null): CollectionState {
  return STATES.includes(raw as CollectionState) ? (raw as CollectionState) : "default"
}

function PatternLibraryStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <CollectionTableScreen state={state} />
}

export default function PatternLibraryPage() {
  return (
    <React.Suspense fallback={<CollectionTableScreen state="loading" />}>
      <PatternLibraryStateReader />
    </React.Suspense>
  )
}
