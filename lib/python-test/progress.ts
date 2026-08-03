export type Stat = { seen: number; correct: number }
export type Stats = Record<string, Stat>
export type MarkColor = "check" | "green" | "yellow" | "red"
export type Flags = Record<string, MarkColor[]>
export type Progress = { stats: Stats; flags: Flags }

export const MARK_COLORS: MarkColor[] = ["check", "green", "yellow", "red"]
export const MARK_LABEL: Record<MarkColor, string> = {
  check: "チェック",
  green: "緑",
  yellow: "黄",
  red: "赤",
}

export function flagList(flags: Flags, id: number): MarkColor[] {
  return flags[id] ?? []
}

export function flagCount(flags: Flags, id: number, color: MarkColor): number {
  return flagList(flags, id).filter((item) => item === color).length
}

const LS_PROGRESS = "python_data_exam_progress_v2"
const LEGACY_LS_STATS = "da_exam_stats_v1"
const LEGACY_LS_FLAGS = "da_exam_flags_v1"
const EMPTY_PROGRESS: Progress = { stats: {}, flags: {} }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseStats(value: unknown): Stats {
  if (!isRecord(value)) return {}

  const stats: Stats = {}
  for (const [id, raw] of Object.entries(value)) {
    if (!isRecord(raw)) continue
    const seen = Number(raw.seen)
    const correct = Number(raw.correct)
    if (!Number.isFinite(seen) || !Number.isFinite(correct)) continue
    if (seen < 0 || correct < 0 || correct > seen) continue
    stats[id] = { seen: Math.floor(seen), correct: Math.floor(correct) }
  }
  return stats
}

function isMarkColor(value: unknown): value is MarkColor {
  return typeof value === "string" && MARK_COLORS.includes(value as MarkColor)
}

function parseFlags(value: unknown): Flags {
  if (!isRecord(value)) return {}

  const flags: Flags = {}
  for (const [id, raw] of Object.entries(value)) {
    const sequence = Array.isArray(raw)
      ? raw.filter(isMarkColor)
      : [raw].filter(isMarkColor)
    if (sequence.length > 0) flags[id] = sequence
  }
  return flags
}

/** progress.json と旧ブラウザ保存の両形式を安全なアプリ状態へ正規化する。 */
export function parseProgress(value: unknown): Progress {
  if (!isRecord(value)) return EMPTY_PROGRESS
  return {
    stats: parseStats(value.stats),
    flags: parseFlags(value.flags),
  }
}

/**
 * GitHub Pages の静的 export ではサーバー保存が使えないため、ブラウザ保存を正本にする。
 * 旧 Vite 版と同じキーも読み込み、最初の保存時に新しい単一キーへ移行する。
 */
export async function loadProgress(): Promise<Progress> {
  try {
    const current = localStorage.getItem(LS_PROGRESS)
    if (current) return parseProgress(JSON.parse(current))

    return parseProgress({
      stats: JSON.parse(localStorage.getItem(LEGACY_LS_STATS) ?? "{}"),
      flags: JSON.parse(localStorage.getItem(LEGACY_LS_FLAGS) ?? "{}"),
    })
  } catch {
    return EMPTY_PROGRESS
  }
}

export function persistProgress(data: Progress) {
  try {
    localStorage.setItem(LS_PROGRESS, JSON.stringify(parseProgress(data)))
  } catch {
    // Private browsing や容量制限で保存できない場合も、セッション内の学習は継続する。
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(LS_PROGRESS)
    localStorage.removeItem(LEGACY_LS_STATS)
    localStorage.removeItem(LEGACY_LS_FLAGS)
  } catch {
    // 保存領域を利用できない環境では何もしない。
  }
}

export function downloadProgress(data: Progress) {
  const blob = new Blob([JSON.stringify(parseProgress(data), null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "progress.json"
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readProgressFile(file: File): Promise<Progress> {
  let value: unknown
  try {
    value = JSON.parse(await file.text())
  } catch {
    throw new Error("JSONとして読み込めませんでした。")
  }

  if (!isRecord(value) || (!isRecord(value.stats) && !isRecord(value.flags))) {
    throw new Error("progress.json の形式ではありません。")
  }
  return parseProgress(value)
}
