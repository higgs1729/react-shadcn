import type { Metadata } from "next"
import { PlayCountTracker } from "../../components/PlayCountTracker"
import PulseTraceGame from "./PulseTraceGame"

export const metadata: Metadata = {
  title: "PULSE//TRACE",
  description: "4レーンのタイミングを読む、60秒のリズムゲーム。",
}

export default function PulseTracePage() {
  return (
    <>
      <PlayCountTracker gameId="pulse-trace" />
      <PulseTraceGame />
    </>
  )
}
