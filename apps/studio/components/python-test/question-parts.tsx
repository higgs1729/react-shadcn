import { ChevronDownIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import type { Question } from "@/lib/python-test/data"
import { choiceLabel } from "@/lib/python-test/quiz"
import { cn } from "@/lib/utils"

/** 選択肢1件の見た目。正誤の色は success / destructive トークンに寄せる。 */
const CHOICE_BASE =
  "h-auto w-full justify-start whitespace-pre-wrap py-3 text-left text-sm leading-relaxed"

type ChoiceListProps = {
  question: Question
  /** 選んだ選択肢。未解答なら null */
  selected: number | null
  /** 正解・不正解を開示するか(解答後・閲覧時は true) */
  revealed: boolean
  onSelect?: (index: number) => void
}

export function ChoiceList({
  question,
  selected,
  revealed,
  onSelect,
}: ChoiceListProps) {
  return (
    <div className="flex flex-col gap-2">
      {question.choices.map((c, i) => {
        const isCorrect = revealed && i === question.answer
        const isWrong = revealed && i === selected && i !== question.answer
        return (
          <Button
            key={i}
            variant="outline"
            disabled={revealed}
            onClick={onSelect ? () => onSelect(i) : undefined}
            className={cn(
              CHOICE_BASE,
              // disabled 時も色が沈まないよう、開示後は不透明度を戻す
              revealed && "opacity-100",
              isCorrect &&
                "border-success/50 bg-success/10 text-success disabled:opacity-100",
              isWrong &&
                "border-destructive/50 bg-destructive/10 text-destructive disabled:opacity-100"
            )}
          >
            <span className="font-medium">{choiceLabel(i)}.</span>
            <span className="flex-1">{c}</span>
            {revealed && i === selected && (
              <span className="shrink-0 text-xs opacity-80">あなたの解答</span>
            )}
          </Button>
        )
      })}
    </div>
  )
}

/** 各選択肢ごとの解説(折りたたみ)。choiceExp が無い問題では何も出さない。 */
function ChoiceExplanations({ question }: { question: Question }) {
  if (!question.choiceExp) return null
  return (
    <Collapsible>
      <CollapsibleTrigger
        render={<Button variant="link" size="sm" className="px-0" />}
      >
        各選択肢の解説を見る
        <ChevronDownIcon className="transition-transform group-data-[panel-open]/button:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-1.5">
        {question.choices.map((_, i) => {
          const ok = i === question.answer
          return (
            <div
              key={i}
              className={cn(
                "rounded-md px-3 py-2 text-xs leading-relaxed",
                ok
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <b>{choiceLabel(i)}</b> {ok ? "◯" : "✕"}{" "}
              {question.choiceExp?.[i] ?? ""}
            </div>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}

type ExplanationProps = {
  question: Question
  /** 正誤の判定行を出す場合に渡す。閲覧モードでは省略する */
  verdict?: boolean
}

export function Explanation({ question, verdict }: ExplanationProps) {
  return (
    <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm">
      <div>
        {verdict !== undefined && (
          <b className={verdict ? "text-success" : "text-destructive"}>
            {verdict ? "正解" : "不正解"}{" "}
          </b>
        )}
        正解は <b>{choiceLabel(question.answer)}</b>。
      </div>
      <div className="mt-1.5 whitespace-pre-wrap text-muted-foreground">
        {question.exp}
      </div>
      <ChoiceExplanations question={question} />
    </div>
  )
}

/** 問題文。改行を保持する。 */
export function QuestionText({ text }: { text: string }) {
  return <div className="mb-3.5 text-base whitespace-pre-wrap">{text}</div>
}
