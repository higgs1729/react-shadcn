import Image from "next/image"
import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

const teamTCoinSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/team-t-app/assets/reward-card-coin.png`

export function TeamTCoinImage({
  className,
  priority = false,
  style,
}: {
  className?: string
  priority?: boolean
  style?: CSSProperties
}) {
  return (
    <Image
      src={teamTCoinSrc}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      priority={priority}
      draggable={false}
      style={style}
      className={cn(
        "size-6 shrink-0 object-contain drop-shadow-[0_2px_3px_rgba(120,77,12,0.38)] select-none",
        className
      )}
    />
  )
}

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
      <TeamTCoinImage priority />
      <span>
        {prefix}
        {coins}
      </span>
      {label ? <span className="sr-only">枚</span> : null}
    </span>
  )
}
