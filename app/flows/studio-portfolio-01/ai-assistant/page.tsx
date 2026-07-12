"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ConversationAssistantScreen, type ConversationAssistantState } from "@/app/conversation-assistant-01/conversation-assistant-screen"

// ai-assistant's stateCoveragePlan is [default, loading], reachable via `?state=`.
const STATES: readonly ConversationAssistantState[] = ["default", "loading"]

function resolveState(raw: string | null): ConversationAssistantState {
  return STATES.includes(raw as ConversationAssistantState) ? (raw as ConversationAssistantState) : "default"
}

function AiAssistantStateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <ConversationAssistantScreen state={state} />
}

export default function AiAssistantPage() {
  return (
    <React.Suspense fallback={<ConversationAssistantScreen state="loading" />}>
      <AiAssistantStateReader />
    </React.Suspense>
  )
}
