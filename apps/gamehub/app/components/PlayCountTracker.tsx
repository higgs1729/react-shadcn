"use client"

import { useEffect } from "react"
import { recordGamePlay } from "../lib/stats-api"

export function PlayCountTracker({ gameId }: { gameId: string }) {
  useEffect(() => {
    recordGamePlay(gameId)
  }, [gameId])

  return null
}
