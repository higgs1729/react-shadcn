import { Undo2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  flagCount,
  flagList,
  MARK_COLORS,
  MARK_LABEL,
  type Flags,
  type MarkColor,
} from "@/lib/python-test/progress"
import { cn } from "@/lib/utils"

// Tailwind にクラス名を検出させるため、動的合成ではなく静的な対応表にする。
export const MARK_DOT: Record<MarkColor, string> = {
  check: "bg-mark-check",
  green: "bg-mark-green",
  yellow: "bg-mark-yellow",
  red: "bg-mark-red",
}

export function MarkDot({
  color,
  className,
}: {
  color: MarkColor
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block size-3 rounded-full",
        MARK_DOT[color],
        className
      )}
      aria-hidden="true"
    />
  )
}

/** 一覧の行に出す「色×回数」の要約。0回の色は出さない。 */
export function MarkCounts({ flags, id }: { flags: Flags; id: number }) {
  const items = MARK_COLORS.map(
    (c) => [c, flagCount(flags, id, c)] as const
  ).filter(([, n]) => n > 0)
  if (items.length === 0) return null
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {items.map(([c, n]) => (
        <span
          key={c}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
          title={`${MARK_LABEL[c]} ${n}回`}
        >
          <MarkDot color={c} className="size-2.5" />×{n}
        </span>
      ))}
    </span>
  )
}

type MarkBarProps = {
  flags: Flags
  id: number
  onAdd: (color: MarkColor) => void
  onUndo: () => void
}

/** 4色マークの付与・取消と、付与順の可視化。 */
export function MarkBar({ flags, id, onAdd, onUndo }: MarkBarProps) {
  const seq = flagList(flags, id)
  return (
    <div className="mt-4 border-t pt-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">マーク:</span>
        {MARK_COLORS.map((c) => {
          const n = flagCount(flags, id, c)
          return (
            <Button
              key={c}
              variant="outline"
              size="sm"
              onClick={() => onAdd(c)}
              className={cn(
                "rounded-full",
                n > 0 && "border-primary bg-primary/10 text-primary"
              )}
            >
              <MarkDot color={c} />
              {MARK_LABEL[c]}
              <Badge
                variant={n > 0 ? "default" : "secondary"}
                className="h-4 px-1.5"
              >
                {n}
              </Badge>
            </Button>
          )
        })}
        <Button variant="ghost" size="sm" onClick={onUndo}>
          <Undo2Icon />
          取消
        </Button>
      </div>
      <div className="mt-2 flex min-h-4.5 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {seq.length === 0 ? (
          <span>まだマークはありません</span>
        ) : (
          <>
            <span>順番:</span>
            {seq.map((c, i) => (
              <span
                key={i}
                className="relative inline-flex items-center justify-center"
                title={`${i + 1}. ${MARK_LABEL[c]}`}
              >
                <MarkDot color={c} className="size-4" />
                <span className="absolute text-[0.6rem] font-bold text-white">
                  {i + 1}
                </span>
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
