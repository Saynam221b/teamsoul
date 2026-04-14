"use client";

import type { Tournament } from "@/data/types";
import { formatDate, formatPlacement, formatPrize } from "@/data/helpers";
import TierBadge from "../shared/TierBadge";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

interface TournamentCardProps {
  tournament: Tournament;
  index: number;
  featured?: boolean;
}

export default function TournamentCard({
  tournament,
  index,
  featured = false,
}: TournamentCardProps) {
  const { name, year, tier, placement, prize, isWin, status, eventDate, location, details } =
    tournament;
  const placementLabel =
    status === "upcoming" || status === "live"
      ? "Scheduled"
      : typeof placement === "number"
        ? formatPlacement(placement)
        : placement;

  const statusLabel =
    status === "upcoming" ? "Upcoming" : status === "live" ? "Ongoing" : "Completed";

  const statusClass =
    status === "upcoming"
      ? "tag tag-upcoming"
      : status === "live"
        ? "tag tag-live"
        : "tag tag-completed";

  return (
    <RevealOnScroll
      as="article"
      delay={Math.min(index * 0.03, 0.22)}
      distance={20}
      margin="-30px"
      intensity="soft"
      className={`${featured ? "bento-featured" : ""} archive-panel rounded-[24px] p-5 md:rounded-[26px]`}
    >
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-4 md:gap-3">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <TierBadge tier={tier} size="sm" />
          <span className={statusClass}>{statusLabel}</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted md:text-xs md:tracking-[0.18em]">{year}</span>
      </div>

      <h3 className="font-display text-2xl uppercase leading-[0.9] text-white md:text-4xl">
        {name}
      </h3>

      {details && <p className="mt-2 text-xs leading-6 text-text-secondary md:mt-3 md:text-sm md:leading-7">{details}</p>}

      {(eventDate || location) && (
        <div className="mt-3 grid gap-2 border-t border-white/8 pt-3 sm:grid-cols-2 md:mt-4 md:gap-3 md:pt-4">
          {eventDate && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Date</p>
              <p className="mt-1 text-sm text-text-secondary">
                {formatDate(eventDate)}
              </p>
            </div>
          )}
          {location && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Location</p>
              <p className="mt-1 text-sm text-text-secondary">{location}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 border-t border-white/8 pt-4 md:mt-5 md:gap-4 md:pt-5">
        <div className="min-w-0 rounded-[18px] border border-white/8 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
            {status === "upcoming" || status === "live" ? "Slot" : "Placement"}
          </p>
          <p
            className={`mt-2 break-words font-display uppercase leading-[0.9] ${
              status === "upcoming" || status === "live"
                ? "text-[2.4rem] md:text-[3.2rem]"
                : "text-3xl md:text-5xl"
            } ${isWin ? "text-accent" : "text-white"}`}
          >
            {placementLabel}
          </p>
        </div>

        {prize !== null && prize > 0 && (
          <div className="min-w-0 rounded-[18px] border border-white/8 bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Approx prize</p>
            <p className="mt-2 break-words font-display text-2xl uppercase leading-[0.92] text-white md:text-[2.75rem]">
              {formatPrize(prize)}
            </p>
          </div>
        )}
      </div>

      {isWin && status !== "upcoming" && status !== "live" && (
        <div className="mt-4 md:mt-5">
          <span className="tag tag-won">Won the title</span>
        </div>
      )}
    </RevealOnScroll>
  );
}
