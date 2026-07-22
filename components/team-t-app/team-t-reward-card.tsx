"use client"

import { ArrowRightIcon } from "lucide-react"

import { TeamTCoinImage } from "./team-t-coin-balance"

interface TeamTRewardCardProps {
  rewardAmount: number
  remaining: number
  total: number
  onEnter: () => void
}

export function TeamTRewardCard({
  rewardAmount,
  remaining,
  total,
  onEnter,
}: TeamTRewardCardProps) {
  const safeTotal = Math.max(1, total)
  const safeRemaining = Math.min(Math.max(0, remaining), safeTotal)
  const completionPercent = Math.round(
    ((safeTotal - safeRemaining) / safeTotal) * 100
  )

  return (
    <>
      <style>{`
        .team-t-reward-card {
          --reward-card-bg: #17181c;
          --reward-card-border: #27272a;
          --reward-card-inset: #09090b;
          --reward-card-text: #f4f1ea;
          --reward-heading: #f7f5f0;
          --reward-rail-bg: #3a2b18;
          --reward-rail-border: #b88731;
          --reward-rail-inset: #16120d;
          --reward-rail-highlight: #c19346;
          --reward-amount: #f1c35f;
          --reward-amount-shadow: #5f3a09;
          --reward-divider: #9c712c;
          --reward-status: #c7a46d;
          --reward-count: #f7f3eb;
          --reward-separator: #8c8986;
          --reward-goal: #9d9992;
          --reward-track: #282724;
          --reward-track-border: #0c0d0f;
        }

        html[data-team-t-theme="light"] .team-t-reward-card,
        html.light:not([data-team-t-theme]) .team-t-reward-card {
          --reward-card-bg: #f7f4ec;
          --reward-card-border: #cbbd9e;
          --reward-card-inset: #fffdf8;
          --reward-card-text: #28231c;
          --reward-heading: #211d17;
          --reward-rail-bg: #eee0c2;
          --reward-rail-border: #a97928;
          --reward-rail-inset: #d1b878;
          --reward-rail-highlight: #fff0bd;
          --reward-amount: #6f4b13;
          --reward-amount-shadow: rgba(255, 255, 255, 0.75);
          --reward-divider: #b99048;
          --reward-status: #74531d;
          --reward-count: #28231c;
          --reward-separator: #8e8578;
          --reward-goal: #746c61;
          --reward-track: #ded6c8;
          --reward-track-border: #b8a98c;
        }
      `}</style>
      <article
        className="team-t-reward-card grid min-h-32 grid-cols-[3.75rem_minmax(0,1fr)] overflow-hidden rounded-2xl border-[3px] border-[var(--reward-card-border)] bg-[var(--reward-card-bg)] text-[var(--reward-card-text)] shadow-[inset_0_0_0_1px_var(--reward-card-inset)]"
        aria-label="APIアーケードへの報酬カード"
      >
      <div className="flex flex-col items-center justify-center gap-1.5 border-r-2 border-[var(--reward-rail-border)] bg-[var(--reward-rail-bg)] px-2 py-3 shadow-[inset_0_0_0_3px_var(--reward-rail-inset),inset_0_0_0_4px_var(--reward-rail-highlight)]">
        <TeamTCoinImage
          className="size-10 object-contain drop-shadow-[0_3px_3px_rgba(0,0,0,0.48)]"
        />
        <strong
          className="max-w-full truncate text-2xl leading-none font-bold text-[var(--reward-amount)] tabular-nums"
          style={{ textShadow: "0 2px 0 var(--reward-amount-shadow)" }}
          aria-label={`報酬 ${rewardAmount}`}
        >
          {rewardAmount}
        </strong>
      </div>

      <div className="flex min-w-0 flex-col px-2.5 py-3">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 flex-1 text-sm leading-tight font-extrabold tracking-[-0.03em] text-[var(--reward-heading)]">
            APIアーケードへ
          </h2>
          <button
            type="button"
            onClick={onEnter}
            aria-label="APIアーケードへ進む"
            className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-[#d4aa54] bg-[#4b236f] text-white outline-none ring-[#18121f] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#61308d] focus-visible:ring-3 active:translate-y-px active:scale-95"
          >
            <ArrowRightIcon className="size-4" strokeWidth={3} />
          </button>
        </div>

        <div className="mt-auto flex items-center gap-1 border-t border-[var(--reward-divider)] pt-2 text-[0.58rem] font-semibold text-[var(--reward-status)]">
          <TeamTCoinImage className="size-3.5 shrink-0 object-contain" />
          <span className="whitespace-nowrap">次のコインまで</span>
          <strong className="ml-auto text-sm leading-none text-[var(--reward-count)] tabular-nums">
            {safeRemaining}
          </strong>
          <span className="text-xs text-[var(--reward-separator)]">/</span>
          <strong className="text-xs leading-none text-[var(--reward-goal)] tabular-nums">
            {safeTotal}
          </strong>
        </div>

        <div
          className="relative mt-2 h-2 overflow-hidden rounded-full border border-[var(--reward-track-border)] bg-[var(--reward-track)] shadow-[inset_0_2px_3px_rgba(0,0,0,0.28)]"
          role="progressbar"
          aria-label="次のコインまでの進捗"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionPercent}
          aria-valuetext={`${completionPercent}%完了、残り${safeRemaining}/${safeTotal}`}
        >
          <span
            className="block h-full rounded-[inherit] border-r border-[#ffe39a] bg-[#d7a43a] transition-[width] duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>
      </article>
    </>
  )
}
