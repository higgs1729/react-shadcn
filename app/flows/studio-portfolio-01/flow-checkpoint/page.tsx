"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { WorkflowScreen, type WorkflowState } from "@/app/workflow-01/workflow-screen"

// flow-checkpoint's stateCoveragePlan is [default, loading], reachable via `?state=`.
const STATES: readonly WorkflowState[] = ["default", "loading"]

function resolveState(raw: string | null): WorkflowState {
  return STATES.includes(raw as WorkflowState) ? (raw as WorkflowState) : "default"
}

function FlowCheckpointStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <WorkflowScreen state={state} />
}

export default function FlowCheckpointPage() {
  return (
    <React.Suspense fallback={<WorkflowScreen state="loading" />}>
      <FlowCheckpointStateReader />
    </React.Suspense>
  )
}
