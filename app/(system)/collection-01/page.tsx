"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { CollectionTableScreen, type CollectionState } from "./collection-screen"

function CollectionTableStateReader() {
  const searchParams = useSearchParams()
  const raw = searchParams.get("state")
  const state: CollectionState =
    raw === "loading" || raw === "empty" || raw === "error" ? raw : "default"
  return <CollectionTableScreen state={state} />
}

export default function Page() {
  return (
    <React.Suspense fallback={<CollectionTableScreen state="loading" />}>
      <CollectionTableStateReader />
    </React.Suspense>
  )
}
