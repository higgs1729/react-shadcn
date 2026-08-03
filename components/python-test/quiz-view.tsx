import * as React from "react"
import { ChevronRightIcon, ClipboardListIcon, SquareIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CATEGORIES } from "@/lib/python-test/data"
import { MarkBar } from "@/components/python-test/mark-bar"
import { HistoryDialog } from "@/components/python-test/history-dialog"
import {
  ChoiceList,
  Explanation,
  QuestionText,
} from "@/components/python-test/question-parts"
import type { Flags, MarkColor } from "@/lib/python-test/progress"
import type { Session } from "@/lib/python-test/quiz"

type QuizViewProps = {
  session: Session
  /** この問題で選んだ選択肢。未解答なら null */
  selected: number | null
  onAnswer: (index: number) => void
  onNext: () => void
  onQuit: () => void
  flags: Flags
  onAddFlag: (id: number, color: MarkColor) => void
  onUndoFlag: (id: number) => void
}

export function QuizView({
  session,
  selected,
  onAnswer,
  onNext,
  onQuit,
  flags,
  onAddFlag,
  onUndoFlag,
}: QuizViewProps) {
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [quitOpen, setQuitOpen] = React.useState(false)
  const q = session.list[session.idx]
  const answered = session.answers.length
  const accuracy =
    answered === 0
      ? "正答率: -"
      : `正答率: ${session.correct}/${answered} (${Math.round(
          (session.correct / answered) * 100
        )}%)`

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            第 {session.idx + 1} 問 / 全 {session.list.length} 問
          </span>
          <Badge variant="secondary">{CATEGORIES[q.cat]}</Badge>
        </div>
        <Progress
          value={(session.idx / session.list.length) * 100}
          className="my-3"
        />
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{accuracy}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(true)}
          >
            <ClipboardListIcon />
            解答履歴
          </Button>
        </div>

        <QuestionText text={q.q} />
        <ChoiceList
          question={q}
          selected={selected}
          revealed={selected !== null}
          onSelect={onAnswer}
        />
        {selected !== null && (
          <Explanation question={q} verdict={selected === q.answer} />
        )}

        <MarkBar
          flags={flags}
          id={q.id}
          onAdd={(c) => onAddFlag(q.id, c)}
          onUndo={() => onUndoFlag(q.id)}
        />

        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setQuitOpen(true)}>
            <SquareIcon />
            中断してホームへ
          </Button>
          {selected !== null && (
            <Button onClick={onNext}>
              次へ
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      </CardContent>

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        session={session}
      />

      <AlertDialog open={quitOpen} onOpenChange={setQuitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>中断してホームへ戻る</AlertDialogTitle>
            <AlertDialogDescription>
              現在の解答内容(このセッションの履歴)は保存されずに終了します。ホームに戻りますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setQuitOpen(false)
                onQuit()
              }}
            >
              ホームに戻る
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
