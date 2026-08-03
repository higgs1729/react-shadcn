import type { CSSProperties } from "react"

import { TeamTCoinImage } from "./team-t-coin-balance"

const coinParticles = [
  { x: -30, y: -46, delay: 0, rotation: -28, size: 18 },
  { x: 15, y: -62, delay: 45, rotation: 34, size: 15 },
  { x: 48, y: -34, delay: 90, rotation: 54, size: 19 },
  { x: -45, y: -12, delay: 120, rotation: -42, size: 14 },
  { x: 42, y: 8, delay: 160, rotation: 72, size: 13 },
] as const

export function TeamTCoinBurst({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div
      aria-live="polite"
      className="team-t-coin-burst pointer-events-none fixed bottom-28 left-4 z-50"
    >
      <div className="team-t-coin-burst__particles" aria-hidden="true">
        {coinParticles.map((particle, index) => (
          <TeamTCoinImage
            key={index}
            className="team-t-coin-burst__particle absolute"
            style={
              {
                "--coin-x": `${particle.x}px`,
                "--coin-y": `${particle.y}px`,
                "--coin-delay": `${particle.delay}ms`,
                "--coin-rotation": `${particle.rotation}deg`,
                "--coin-size": `${particle.size}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="team-t-coin-burst__label flex items-center gap-2.5 rounded-2xl border border-[color:var(--team-t-gold-line)] bg-card/95 py-2.5 pr-4 pl-2.5 text-foreground shadow-[0_14px_36px_rgba(0,0,0,0.32),0_0_0_1px_rgba(199,171,112,0.12)] backdrop-blur-md">
        <span className="team-t-coin-burst__coin relative grid size-10 place-items-center" aria-hidden="true">
          <span className="team-t-coin-burst__ring absolute inset-0 rounded-full border border-[color:var(--team-t-gold)]/70" />
          <TeamTCoinImage className="size-9" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-base font-extrabold text-[color:var(--team-t-gold-strong)] tabular-nums">
            +1
          </span>
          <span className="mt-1 text-[0.68rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            コイン獲得
          </span>
        </span>
      </div>
      <style>{`
        @keyframes team-t-coin-burst {
          0% { opacity: 0; transform: translateY(1rem) scale(0.82); }
          12% { opacity: 1; transform: translateY(0) scale(1.04); }
          22% { transform: translateY(0) scale(1); }
          78% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-0.8rem) scale(0.96); }
        }
        @keyframes team-t-coin-pop {
          0% { transform: rotateY(-70deg) scale(0.55); }
          45% { transform: rotateY(18deg) scale(1.16); }
          70% { transform: rotateY(-8deg) scale(0.96); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        @keyframes team-t-coin-ring {
          0% { opacity: 0.8; transform: scale(0.55); }
          75%, 100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes team-t-coin-particle {
          0% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0.4); }
          18% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--coin-x), var(--coin-y)) rotate(var(--coin-rotation)) scale(0.82); }
        }
        .team-t-coin-burst {
          animation: team-t-coin-burst 2.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .team-t-coin-burst__coin {
          perspective: 10rem;
          animation: team-t-coin-pop 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.25) both;
        }
        .team-t-coin-burst__ring {
          animation: team-t-coin-ring 0.9s 0.12s ease-out both;
        }
        .team-t-coin-burst__particle {
          top: 0.75rem;
          left: 1.35rem;
          width: var(--coin-size);
          height: var(--coin-size);
          animation: team-t-coin-particle 0.9s var(--coin-delay) cubic-bezier(0.16, 0.84, 0.44, 1) both;
        }
        html[data-reduce-motion="true"] .team-t-coin-burst,
        html[data-reduce-motion="true"] .team-t-coin-burst__coin,
        html[data-reduce-motion="true"] .team-t-coin-burst__ring { animation: none; }
        html[data-reduce-motion="true"] .team-t-coin-burst__particle { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .team-t-coin-burst,
          .team-t-coin-burst__coin,
          .team-t-coin-burst__ring { animation: none; }
          .team-t-coin-burst__particle { display: none; }
        }
      `}</style>
    </div>
  )
}
