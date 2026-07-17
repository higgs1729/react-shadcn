import { CoinsIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function TeamTCoinBalance({
  coins,
  className,
  label = true,
  prefix = "",
}: {
  coins: number
  className?: string
  label?: boolean
  prefix?: string
}) {
  return (
    <span
      aria-label={`コイン ${coins} 枚`}
      className={cn(
        "team-t-coin-balance inline-flex items-center gap-1.5 font-semibold text-[color:var(--team-t-gold-strong)] tabular-nums",
        className
      )}
    >
      <span className="grid size-5 place-items-center rounded-full bg-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-500/70">
        <CoinsIcon className="size-3.5" aria-hidden="true" />
      </span>
      <span>
        {prefix}
        {coins}
      </span>
      {label ? <span className="sr-only">枚</span> : null}
    </span>
  )
}
