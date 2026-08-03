import * as React from "react"

import {
  clearLocalStorage,
  loadProgress,
  persistProgress,
  type Flags,
  type MarkColor,
  type Progress,
  type Stats,
} from "@/lib/python-test/progress"

/**
 * 学習データ(成績・マーク)を React state として保持し、変更のたびに永続化する。
 * 読み込みが終わるまで `ready` は false。
 */
export function useProgress() {
  const [stats, setStats] = React.useState<Stats>({})
  const [flags, setFlags] = React.useState<Flags>({})
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    void loadProgress().then((d) => {
      if (!alive) return
      setStats(d.stats)
      setFlags(d.flags)
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  // 保存は読み込み完了後の変更だけを対象にする(初期値の空データで
  // progress.json を上書きしてしまわないように)。
  React.useEffect(() => {
    if (!ready) return
    persistProgress({ stats, flags })
  }, [ready, stats, flags])

  const recordAnswer = React.useCallback((id: number, correct: boolean) => {
    setStats((prev) => {
      const cur = prev[id] ?? { seen: 0, correct: 0 }
      return {
        ...prev,
        [id]: { seen: cur.seen + 1, correct: cur.correct + (correct ? 1 : 0) },
      }
    })
  }, [])

  const addFlag = React.useCallback((id: number, color: MarkColor) => {
    setFlags((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), color] }))
  }, [])

  const undoFlag = React.useCallback((id: number) => {
    setFlags((prev) => {
      const seq = prev[id]
      if (!seq?.length) return prev
      const next = { ...prev }
      if (seq.length === 1) delete next[id]
      else next[id] = seq.slice(0, -1)
      return next
    })
  }, [])

  const resetAll = React.useCallback(() => {
    clearLocalStorage()
    setStats({})
    setFlags({})
  }, [])

  const replaceProgress = React.useCallback((next: Progress) => {
    setStats(next.stats)
    setFlags(next.flags)
    persistProgress(next)
  }, [])

  const snapshot = React.useCallback(
    (): Progress => ({ stats, flags }),
    [stats, flags]
  )

  return {
    stats,
    flags,
    ready,
    recordAnswer,
    addFlag,
    undoFlag,
    resetAll,
    replaceProgress,
    snapshot,
  }
}
