import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, QUESTIONS } from "@/lib/python-test/data"
import {
  ChoiceList,
  Explanation,
  QuestionText,
} from "@/components/python-test/question-parts"
import type { Session } from "@/lib/python-test/quiz"
import { cn } from "@/lib/utils"

type HistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: Session
}

/** 今回のセッションの解答履歴。一覧 → 個別の復習に切り替わる。 */
export function HistoryDialog({
  open,
  onOpenChange,
  session,
}: HistoryDialogProps) {
  const [detailIdx, setDetailIdx] = React.useState<number | null>(null)

  // 開き直したときは必ず一覧から始める
  React.useEffect(() => {
    if (open) setDetailIdx(null)
  }, [open])

  const record = detailIdx === null ? null : session.answers[detailIdx]
  const question = record ? QUESTIONS.find((x) => x.id === record.id) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-4rem)] gap-4 overflow-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>今回の解答履歴</DialogTitle>
        </DialogHeader>

        {record && question ? (
          <div>
            <Button
              variant="outline"
              size="sm"
              className="mb-3"
              onClick={() => setDetailIdx(null)}
            >
              <ChevronLeftIcon />
              履歴一覧へ戻る
            </Button>
            <div className="mb-2 flex justify-end">
              <Badge variant="secondary">
                {CATEGORIES[question.cat]}
                {question.level ? ` ／ 難易度${question.level}` : ""} ／ No.
                {question.id}
              </Badge>
            </div>
            <QuestionText text={question.q} />
            <ChoiceList question={question} selected={record.sel} revealed />
            <Explanation question={question} />
          </div>
        ) : session.answers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ解答した問題がありません。
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {session.answers.map((a, i) => {
              const q = QUESTIONS.find((x) => x.id === a.id)
              return (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto w-full justify-start gap-2.5 py-2.5 text-left"
                  onClick={() => setDetailIdx(i)}
                >
                  <span className="w-14 shrink-0 text-xs text-muted-foreground">
                    第{i + 1}問
                  </span>
                  <span className="flex-1 truncate text-sm">
                    {q ? q.q.split("\n")[0] : ""}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-medium",
                      a.right ? "text-success" : "text-destructive"
                    )}
                  >
                    {a.right ? "○" : "✕"}
                  </span>
                </Button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
