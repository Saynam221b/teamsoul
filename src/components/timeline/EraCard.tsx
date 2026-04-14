"use client";

import type { Era } from "@/data/types";
import { getPlayerById } from "@/data/helpers";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

interface EraCardProps {
  era: Era;
  index: number;
}

const OUTCOME_STYLES: Record<string, string> = {
  triumph: "bg-[rgba(57,255,20,0.08)] text-[#39ff14]",
  decline: "bg-[rgba(107,114,128,0.12)] text-[#9ca3af]",
  rebuild: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  dominance: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
};

export default function EraCard({ era, index }: EraCardProps) {
  return (
    <RevealOnScroll
      as="article"
      delay={Math.min(index * 0.06, 0.22)}
      distance={24}
      margin="-50px"
      intensity="soft"
      className="timeline-era-row public-card rounded-[24px] p-5 md:p-6"
    >
      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="border-b border-border-subtle pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
            Era {String(index + 1).padStart(2, "0")}
          </p>
          <p className="mt-3 font-display text-5xl uppercase leading-none text-white">
            {era.yearRange[0]}
          </p>
          <p className="font-display text-3xl uppercase leading-none text-text-muted">
            {era.yearRange[1]}
          </p>
          <span
            className={`mt-5 inline-flex rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.18em] ${OUTCOME_STYLES[era.outcome] ?? OUTCOME_STYLES.rebuild}`}
          >
            {era.outcome}
          </span>
        </div>

        <div>
          <h3 className="font-display text-5xl uppercase leading-[0.88] text-white md:text-6xl">
            {era.name}
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-8 text-text-secondary">{era.description}</p>

          <div className="mt-7 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[18px] border border-border-subtle bg-white/[0.01] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Defining moment
              </p>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{era.definingMoment}</p>
            </div>

            <div className="rounded-[18px] border border-border-subtle bg-white/[0.01] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Core players
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {era.keyPlayers.slice(0, 6).map((playerId) => (
                  <span
                    key={playerId}
                    className="rounded-full border border-border-subtle px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary"
                  >
                    {getPlayerById(playerId)?.displayName ?? playerId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
