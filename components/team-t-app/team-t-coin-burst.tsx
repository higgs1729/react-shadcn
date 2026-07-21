import { CoinsIcon } from "lucide-react"

export function TeamTCoinBurst({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div
      aria-live="polite"
      className="team-t-coin-burst pointer-events-none fixed top-16 right-5 z-50 flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 shadow-lg"
    >
      <CoinsIcon className="size-5" aria-hidden="true" />
      +1
      <style>{`
        @keyframes team-t-coin-burst {
          0% { opacity: 0; transform: translateY(0.75rem) scale(0.8); }
          16% { opacity: 1; transform: translateY(0) scale(1.08); }
          30% { transform: translateY(0) scale(1); }
          82% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-0.5rem) scale(0.96); }
        }
        .team-t-coin-burst { animation: team-t-coin-burst 1.8s ease-out both; }
        html[data-reduce-motion="true"] .team-t-coin-burst { animation: none; }
        @media (prefers-reduced-motion: reduce) {
          .team-t-coin-burst { animation: none; }
        }
      `}</style>
    </div>
  )
}
