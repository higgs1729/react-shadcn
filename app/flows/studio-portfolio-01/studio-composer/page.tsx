"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { DocumentWorkspaceScreen, type DocumentWorkspaceState } from "@/app/document-workspace-01/document-workspace-screen"

// studio-composer's stateCoveragePlan is [default, validation-error], reachable via `?state=`.
const STATES: readonly DocumentWorkspaceState[] = ["default", "validation-error"]

function resolveState(raw: string | null): DocumentWorkspaceState {
  return STATES.includes(raw as DocumentWorkspaceState) ? (raw as DocumentWorkspaceState) : "default"
}

function StudioComposerStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <DocumentWorkspaceScreen state={state} />
}

export default function StudioComposerPage() {
  return (
    <React.Suspense fallback={<DocumentWorkspaceScreen state="default" />}>
      <StudioComposerStateReader />
    </React.Suspense>
  )
}
