import * as React from "react"
import { ChevronLeftIcon, SquareIcon } from "lucide-react"

import { Badge } from "@react-shadcn/shadcn-kit/ui/badge"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import { Card, CardContent } from "@react-shadcn/shadcn-kit/ui/card"
import { NativeSelect, NativeSelectOption } from "@react-shadcn/shadcn-kit/ui/native-select"
import {
  CATEGORIES,
  LEVEL_LABEL,
  LEVELS,
  QUESTIONS,
  type CategoryKey,
  type Level,
} from "@/lib/python-test/data"
import { MarkBar, MarkCounts } from "@/components/python-test/mark-bar"
import {
  ChoiceList,
  Explanation,
  QuestionText,
} from "@/components/python-test/question-parts"
import type { Flags, MarkColor } from "@/lib/python-test/progress"

const CAT_KEYS = Object.keys(CATEGORIES) as CategoryKey[]
const AVAILABLE_LEVELS = LEVELS.filter((lv) =>
  QUESTIONS.some((q) => q.level === lv)
)

type BrowseViewProps = {
  onClose: () => void
  flags: Flags
  onAddFlag: (id: number, color: MarkColor) => void
  onUndoFlag: (id: number) => void
}

/** 問題一覧と、その詳細。詳細は一覧の内部状態として持つ。 */
export function BrowseView({
  onClose,
  flags,
  onAddFlag,
  onUndoFlag,
}: BrowseViewProps) {
  const [cat, setCat] = React.useState<CategoryKey | "all">("all")
  const [level, setLevel] = React.useState<Level | "all">("all")
  const [detailId, setDetailId] = React.useState<number | null>(null)

  const list = React.useMemo(
    () =>
      QUESTIONS.filter(
        (q) =>
          (cat === "all" || q.cat === cat) &&
          (level === "all" || q.level === level)
      ),
    [cat, level]
  )

  const detail =
    detailId === null ? null : QUESTIONS.find((q) => q.id === detailId)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [detailId])

  if (detail) {
    return (
      <Card>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            className="mb-3.5"
            onClick={() => setDetailId(null)}
          >
            <ChevronLeftIcon />
            一覧へ戻る
          </Button>
          <div className="mb-3 flex justify-end">
            <Badge variant="secondary">
              {CATEGORIES[detail.cat]} ／ No.{detail.id}
            </Badge>
          </div>
          <QuestionText text={detail.q} />
          <ChoiceList question={detail} selected={null} revealed />
          <Explanation question={detail} />
          <MarkBar
            flags={flags}
            id={detail.id}
            onAdd={(c) => onAddFlag(detail.id, c)}
            onUndo={() => onUndoFlag(detail.id)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">問題一覧</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            <SquareIcon />
            ホームへ戻る
          </Button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="min-w-24 text-sm text-muted-foreground">
            分野で絞込
          </span>
          <NativeSelect
            size="sm"
            value={cat}
            onChange={(e) => setCat(e.target.value as CategoryKey | "all")}
          >
            <NativeSelectOption value="all">すべての分野</NativeSelectOption>
            {CAT_KEYS.map((k) => (
              <NativeSelectOption key={k} value={k}>
                {CATEGORIES[k]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="min-w-24 text-sm text-muted-foreground">
            難易度で絞込
          </span>
          <NativeSelect
            size="sm"
            value={level}
            onChange={(e) => setLevel(e.target.value as Level | "all")}
          >
            <NativeSelectOption value="all">すべての難易度</NativeSelectOption>
            {AVAILABLE_LEVELS.map((lv) => (
              <NativeSelectOption key={lv} value={lv}>
                {LEVEL_LABEL[lv]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <p className="my-2.5 text-xs text-muted-foreground">{list.length} 問</p>

        <div className="flex flex-col gap-1.5">
          {list.map((q) => (
            <Button
              key={q.id}
              variant="outline"
              className="h-auto w-full justify-start gap-2.5 py-2.5 text-left"
              onClick={() => setDetailId(q.id)}
            >
              <span className="w-14 shrink-0 text-xs text-muted-foreground">
                No.{q.id}
              </span>
              <span className="flex-1 truncate text-sm">
                {q.q.split("\n")[0]}
              </span>
              <MarkCounts flags={flags} id={q.id} />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
