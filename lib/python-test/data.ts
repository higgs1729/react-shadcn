// 問題データ(questions.js)に型を付けて再エクスポートする。
// 問題の追加・編集は questions.js 側で行う(形式は README を参照)。
import {
  CATEGORIES as RAW_CATEGORIES,
  QUESTIONS as RAW_QUESTIONS,
} from "./questions.js"

/** 分野キー。questions.js の cat と対応する。 */
export type CategoryKey =
  | "role"
  | "env"
  | "pybase"
  | "math"
  | "numpy"
  | "pandas"
  | "plot"
  | "ml"
  | "data"

/** 難易度。A(基礎) / B(応用) / C(発展) */
export type Level = "A" | "B" | "C"

export type Question = {
  id: number
  cat: CategoryKey
  level: Level
  q: string
  choices: string[]
  /** 正解の選択肢インデックス(0〜3) */
  answer: number
  exp: string
  /** 各選択肢ごとの解説(任意) */
  choiceExp?: string[]
}

// questions.js は素の JS なので cat/level が string に推論される。
// 実データ側が正しいことを前提に、ここで一度だけ型を確定させる。
export const QUESTIONS = RAW_QUESTIONS as unknown as Question[]
export const CATEGORIES = RAW_CATEGORIES as Record<CategoryKey, string>

export const LEVELS: Level[] = ["A", "B", "C"]
export const LEVEL_LABEL: Record<Level, string> = {
  A: "A(基礎)",
  B: "B(応用)",
  C: "C(発展)",
}
