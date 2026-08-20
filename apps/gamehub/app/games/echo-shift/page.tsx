import type { Metadata } from "next"
import { PlayCountTracker } from "../../components/PlayCountTracker"
import EchoShiftGame from "./EchoShiftGame"

export const metadata: Metadata = {
  title: "ECHO//SHIFT",
  description:
    "6秒前の自分が敵になる。60秒間の記憶サバイバル・アーケードゲーム。",
}

export default function EchoShiftPage() {
  return (
    <>
      <PlayCountTracker gameId="echo-shift" />
      <EchoShiftGame />
    </>
  )
}
