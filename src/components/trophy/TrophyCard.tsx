"use client";

import type { Tournament } from "@/data/types";
import { formatPlacement, formatPrize, getPlayerById } from "@/data/helpers";
import TierBadge from "../shared/TierBadge";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

interface TrophyCardProps {
  tournament: Tournament;
  index: number;
  featured?: boolean;
}

export default function TrophyCard({ tournament, index, featured = false }: TrophyCardProps) {
  return (
    <RevealOnScroll
      as="article"
      delay={Math.min(index * 0.05, 0.22)}
      distance={24}
      margin="-40px"
      className={`${featured ? "featured-span" : ""} trophy-card rounded-[24px] p-5 md:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <TierBadge tier={tournament.tier} size="md" />
        <span className="text-xs uppercase tracking-[0.18em] text-text-muted">{tournament.year}</span>
      </div>

      <h3 className="mt-5 font-display text-4xl uppercase leading-[0.9] text-white md:text-5xl">
        {tournament.name}
      </h3>

      <div className="mt-6 grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Placement</p>
          <p className="mt-2 font-display text-5xl uppercase leading-none text-energy">
            {typeof tournament.placement === "number"
              ? formatPlacement(tournament.placement)
              : tournament.placement}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Approx prize</p>
          <p className="mt-2 font-display text-4xl uppercase leading-none text-white">
            {formatPrize(tournament.prize)}
          </p>
        </div>
      </div>

      {tournament.roster && tournament.roster.length > 0 && (
        <div className="mt-5 border-t border-border-subtle pt-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Winning roster</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tournament.roster.map((playerId) => (
              <span
                key={playerId}
                className="rounded-full border border-border-subtle px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary"
              >
                {getPlayerById(playerId)?.displayName ?? playerId}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <span className="tag tag-won">Championship secured</span>
      </div>
    </RevealOnScroll>
  );
}
