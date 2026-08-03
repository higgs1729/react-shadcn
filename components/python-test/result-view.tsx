import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CATEGORIES, type CategoryKey } from "@/lib/python-test/data"
import type { Session } from "@/lib/python-test/quiz"
import { cn } from "@/lib/utils"

const PASS_LINE = 70

type ResultViewProps = {
  session: Session
  onHome: () => void
  onRetryWrong: () => void
}

export function ResultView({ session, onHome, onRetryWrong }: ResultViewProps) {
  const total = session.list.length
  const pct = Math.round((session.correct / total) * 100)
  const pass = pct >= PASS_LINE

  const byCat = React.useMemo(() => {
    const m: Partial<Record<CategoryKey, { n: number; c: number }>> = {}
    for (const a of session.answers) {
      const e = (m[a.cat] ??= { n: 0, c: 0 })
      e.n++
      if (a.right) e.c++
    }
    return Object.entries(m) as [CategoryKey, { n: number; c: number }][]
  }, [session.answers])

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardContent className="text-center">
          <p className="text-xs text-muted-foreground">正答率</p>
          <p className="text-5xl font-bold">{pct}%</p>
          <p
            className={cn(
              "my-1.5 font-medium",
              pass ? "text-success" : "text-destructive"
            )}
          >
            {pass
              ? `✅ 合格ライン(${PASS_LINE}%)到達！`
              : `❌ 合格ライン(${PASS_LINE}%)まであと ${PASS_LINE - pct}%`}
          </p>
          <p className="text-xs text-muted-foreground">
            {total}問中 {session.correct}問 正解
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <span className="text-sm font-medium">分野別の正答率</span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>分野</TableHead>
                <TableHead>正答</TableHead>
                <TableHead>正答率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCat.map(([cat, v]) => {
                const p = Math.round((v.c / v.n) * 100)
                return (
                  <TableRow key={cat}>
                    <TableCell>{CATEGORIES[cat]}</TableCell>
                    <TableCell>
                      {v.c}/{v.n}
                    </TableCell>
                    <TableCell
                      className={
                        p >= PASS_LINE ? "text-success" : "text-destructive"
                      }
                    >
                      {p}%
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2.5">
        <Button onClick={onHome}>ホームに戻る</Button>
        <Button variant="outline" onClick={onRetryWrong}>
          誤答した問題だけ復習
        </Button>
      </div>
    </div>
  )
}
