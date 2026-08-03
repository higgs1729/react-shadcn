import type { CategoryKey, Level, Question } from "@/lib/python-test/data"
import {
  flagCount,
  type Flags,
  type MarkColor,
  type Stats,
} from "@/lib/python-test/progress"

/** 絞り込みの比較演算子。off は「指定なし」。 */
export type FilterOp = "off" | "gte" | "lte"
export type NumFilter = { op: FilterOp; val: number }

/** 「詳細な絞り込み」の全条件。すべて AND で評価する。 */
export type Filters = {
  seen: NumFilter
  wrong: NumFilter
} & Record<MarkColor, NumFilter>

export const DEFAULT_FILTERS: Filters = {
  seen: { op: "off", val: 1 },
  wrong: { op: "off", val: 1 },
  check: { op: "off", val: 1 },
  green: { op: "off", val: 1 },
  yellow: { op: "off", val: 1 },
  red: { op: "off", val: 1 },
}

function matches(n: number, f: NumFilter): boolean {
  if (f.op === "gte") return n >= f.val
  if (f.op === "lte") return n <= f.val
  return true
}

/** 1問が「詳細な絞り込み」を通過するか。 */
export function passesFilter(
  q: Question,
  filters: Filters,
  stats: Stats,
  flags: Flags
): boolean {
  const s = stats[q.id] ?? { seen: 0, correct: 0 }
  if (!matches(s.seen, filters.seen)) return false
  if (!matches(s.seen - s.correct, filters.wrong)) return false
  for (const c of ["check", "green", "yellow", "red"] as MarkColor[]) {
    if (!matches(flagCount(flags, q.id, c), filters[c])) return false
  }
  return true
}

/** 分野・難易度・詳細条件をすべて適用した問題プール。 */
export function filterQuestions(
  questions: Question[],
  cats: CategoryKey[],
  levels: Level[],
  filters: Filters,
  stats: Stats,
  flags: Flags
): Question[] {
  return questions.filter(
    (q) =>
      cats.includes(q.cat) &&
      levels.includes(q.level) &&
      passesFilter(q, filters, stats, flags)
  )
}

/** Fisher-Yates。元配列は変更せずコピーを返す。 */
export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 選択肢インデックス(0..3) → "A".."D" */
export function choiceLabel(i: number): string {
  return String.fromCharCode(65 + i)
}

export type AnswerRecord = {
  id: number
  cat: CategoryKey
  right: boolean
  /** 選んだ選択肢のインデックス */
  sel: number
}

export type Session = {
  list: Question[]
  idx: number
  correct: number
  answers: AnswerRecord[]
}

export function newSession(list: Question[]): Session {
  return { list, idx: 0, correct: 0, answers: [] }
}
