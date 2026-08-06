import * as React from "react"
import {
  BookOpenIcon,
  ChevronDownIcon,
  PlayIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@react-shadcn/shadcn-kit/ui/alert-dialog"
import { Button } from "@react-shadcn/shadcn-kit/ui/button"
import { Card, CardContent } from "@react-shadcn/shadcn-kit/ui/card"
import { Checkbox } from "@react-shadcn/shadcn-kit/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@react-shadcn/shadcn-kit/ui/collapsible"
import { Input } from "@react-shadcn/shadcn-kit/ui/input"
import { Label } from "@react-shadcn/shadcn-kit/ui/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@react-shadcn/shadcn-kit/ui/native-select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@react-shadcn/shadcn-kit/ui/toggle-group"
import {
  CATEGORIES,
  LEVEL_LABEL,
  LEVELS,
  QUESTIONS,
  type CategoryKey,
  type Level,
} from "@/lib/python-test/data"
import {
  MARK_COLORS,
  MARK_LABEL,
  type Flags,
  type Stats,
} from "@/lib/python-test/progress"
import {
  filterQuestions,
  type FilterOp,
  type Filters,
  type NumFilter,
} from "@/lib/python-test/quiz"
import { MarkDot } from "@/components/python-test/mark-bar"
import { cn } from "@react-shadcn/shadcn-kit/lib/utils"

const CAT_KEYS = Object.keys(CATEGORIES) as CategoryKey[]

/** 分野・難易度チップの選択中スタイル(base-ui の Toggle は data-pressed を付ける)。 */
const CHIP =
  "rounded-full border border-border data-[pressed]:border-primary data-[pressed]:bg-primary/10 data-[pressed]:text-primary"

export type HomeSettings = {
  cats: CategoryKey[]
  levels: Level[]
  numQ: string
  shuffle: boolean
  wrongOnly: boolean
  filters: Filters
}

type HomeViewProps = {
  settings: HomeSettings
  onChange: (next: HomeSettings) => void
  stats: Stats
  flags: Flags
  onStart: () => void
  onBrowse: () => void
  onReset: () => void
}

export function HomeView({
  settings,
  onChange,
  stats,
  flags,
  onStart,
  onBrowse,
  onReset,
}: HomeViewProps) {
  const { cats, levels, numQ, shuffle, wrongOnly, filters } = settings
  const set = <K extends keyof HomeSettings>(key: K, value: HomeSettings[K]) =>
    onChange({ ...settings, [key]: value })

  const matchCount = React.useMemo(
    () =>
      filterQuestions(QUESTIONS, cats, levels, filters, stats, flags).length,
    [cats, levels, filters, stats, flags]
  )

  const catCounts = React.useMemo(() => {
    const m = {} as Record<CategoryKey, number>
    for (const k of CAT_KEYS) m[k] = QUESTIONS.filter((q) => q.cat === k).length
    return m
  }, [])

  const levelCounts = React.useMemo(() => {
    const m = {} as Record<Level, number>
    for (const lv of LEVELS)
      m[lv] = QUESTIONS.filter((q) => q.level === lv).length
    return m
  }, [])

  const totals = React.useMemo(() => {
    const ids = Object.keys(stats)
    let seen = 0
    let correct = 0
    for (const id of ids) {
      seen += stats[id].seen
      correct += stats[id].correct
    }
    return { ids: ids.length, seen, correct }
  }, [stats])

  const setFilter = (key: keyof Filters, next: NumFilter) =>
    set("filters", { ...filters, [key]: next })

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">分野を選ぶ</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => set("cats", CAT_KEYS)}
              >
                すべて選択
              </Button>
              <Button variant="ghost" size="sm" onClick={() => set("cats", [])}>
                すべて解除
              </Button>
            </div>
          </div>
          <ToggleGroup
            multiple
            value={cats}
            onValueChange={(v) => set("cats", v as CategoryKey[])}
            className="flex-wrap"
          >
            {CAT_KEYS.map((k) => (
              <ToggleGroupItem
                key={k}
                value={k}
                variant="outline"
                className={CHIP}
              >
                {CATEGORIES[k]}
                <span className="text-xs opacity-60">{catCounts[k]}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <span className="text-sm font-medium">難易度を選ぶ</span>
          <ToggleGroup
            multiple
            value={levels}
            onValueChange={(v) => set("levels", v as Level[])}
            className="flex-wrap"
          >
            {LEVELS.filter((lv) => levelCounts[lv] > 0).map((lv) => (
              <ToggleGroupItem
                key={lv}
                value={lv}
                variant="outline"
                className={CHIP}
              >
                {LEVEL_LABEL[lv]}
                <span className="text-xs opacity-60">{levelCounts[lv]}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Label className="gap-2">
              出題数
              <NativeSelect
                size="sm"
                value={numQ}
                onChange={(e) => set("numQ", e.target.value)}
              >
                <NativeSelectOption value="10">10問</NativeSelectOption>
                <NativeSelectOption value="20">20問</NativeSelectOption>
                <NativeSelectOption value="40">
                  40問（本番形式）
                </NativeSelectOption>
                <NativeSelectOption value="0">全問</NativeSelectOption>
              </NativeSelect>
            </Label>
            <div className="flex items-center gap-4">
              <Label>
                <Checkbox
                  checked={shuffle}
                  onCheckedChange={(v) => set("shuffle", v === true)}
                />
                シャッフル
              </Label>
              <Label>
                <Checkbox
                  checked={wrongOnly}
                  onCheckedChange={(v) => set("wrongOnly", v === true)}
                />
                誤答のみ
              </Label>
            </div>
          </div>

          <Button size="lg" className="h-11 w-full text-base" onClick={onStart}>
            <PlayIcon />
            試験を開始
          </Button>
          <Button variant="outline" className="w-full" onClick={onBrowse}>
            <BookOpenIcon />
            問題一覧を見る
          </Button>
        </CardContent>
      </Card>

      <Section title="詳細な絞り込み">
        <FilterRow
          label="回答回数"
          value={filters.seen}
          onChange={(f) => setFilter("seen", f)}
        />
        <FilterRow
          label="間違えた回数"
          value={filters.wrong}
          onChange={(f) => setFilter("wrong", f)}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          マーク回数で絞り込み（指定した条件をすべて満たす問題を出題）
        </p>
        {MARK_COLORS.map((c) => (
          <FilterRow
            key={c}
            label={
              <span className="flex items-center gap-1.5">
                <MarkDot color={c} />
                {MARK_LABEL[c]}
              </span>
            }
            value={filters[c]}
            onChange={(f) => setFilter(c, f)}
          />
        ))}
        <p className="mt-3 text-xs text-muted-foreground">
          現在の条件に一致: {matchCount} 問
        </p>
      </Section>

      <Section title="これまでの成績">
        <p className="text-xs text-muted-foreground">
          {totals.seen === 0 ? (
            "まだ解答履歴がありません。"
          ) : (
            <>
              延べ解答数: <b>{totals.seen}</b>　累計正答率:{" "}
              <b>{Math.round((totals.correct / totals.seen) * 100)}%</b>
              　出題済み問題:{" "}
              <b>
                {totals.ids} / {QUESTIONS.length}
              </b>
            </>
          )}
        </p>
        <ResetButton onReset={onReset} />
      </Section>
    </div>
  )
}

/** 旧 index.html の <details class="sec"> に相当する折りたたみカード。 */
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Collapsible
      render={<Card className="py-0 [--card-spacing:--spacing(5)]" />}
    >
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto w-full justify-between rounded-none px-(--card-spacing) py-4 text-sm font-medium text-muted-foreground"
          />
        }
      >
        {title}
        <ChevronDownIcon className="transition-transform group-data-[panel-open]/button:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-(--card-spacing) pb-5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function FilterRow({
  label,
  value,
  onChange,
}: {
  label: React.ReactNode
  value: NumFilter
  onChange: (next: NumFilter) => void
}) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      <span className="min-w-24 text-sm text-muted-foreground">{label}</span>
      <NativeSelect
        size="sm"
        value={value.op}
        onChange={(e) => onChange({ ...value, op: e.target.value as FilterOp })}
      >
        <NativeSelectOption value="off">指定なし</NativeSelectOption>
        <NativeSelectOption value="gte">以上</NativeSelectOption>
        <NativeSelectOption value="lte">以下</NativeSelectOption>
      </NativeSelect>
      <Input
        type="number"
        min={0}
        value={value.val}
        onChange={(e) =>
          onChange({ ...value, val: Number(e.target.value) || 0 })
        }
        className="h-8 w-20"
      />
      <span className="text-xs text-muted-foreground">回</span>
    </div>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        size="sm"
        className={cn("mt-3")}
        onClick={() => setOpen(true)}
      >
        <TriangleAlertIcon />
        成績・履歴をリセット
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>成績・履歴をリセット</AlertDialogTitle>
          <AlertDialogDescription>
            すべての成績・解答履歴を削除します(マークも削除されます)。この操作は取り消せません。よろしいですか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onReset()
              setOpen(false)
            }}
          >
            削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
