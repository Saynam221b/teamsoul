"use client";

import type { Tournament } from "@/data/types";
import { formatDate, formatPlacement, formatPrize } from "@/data/helpers";
import TierBadge from "../shared/TierBadge";
import { isCompletedWin } from "@/lib/tournamentLifecycle";

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
  const staffLabels = [
    tournament.coach ? `Coach · ${tournament.coach}` : null,
    tournament.analyst ? `Analyst · ${tournament.analyst}` : null,
  ].filter((value): value is string => Boolean(value));
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
    <article
      className={`${featured ? "bento-featured" : ""} archive-card-shell archive-panel public-card route-card-chromatic rounded-[20px] p-4 md:rounded-[22px]`}
      style={{ animationDelay: `${Math.min(index * 28, 180)}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-4 md:gap-3">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <TierBadge tier={tier} size="sm" />
          <span className={statusClass}>{statusLabel}</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted md:text-xs md:tracking-[0.18em]">{year}</span>
      </div>

      <h3 className="font-display text-lg uppercase leading-[0.94] text-white md:text-xl">
        {name}
      </h3>

      {details && <p className="mt-2 text-xs leading-6 text-text-secondary md:mt-3 md:text-sm md:leading-6">{details}</p>}

      {staffLabels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
          {staffLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-text-secondary"
            >
              {label}
            </span>
          ))}
        </div>
      )}

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

      <div className="mt-4 grid gap-3 border-t border-white/8 pt-4 md:mt-4 md:gap-3 md:pt-4">
        <div className="public-card-accent min-w-0 rounded-[14px] border border-white/8 bg-white/[0.02] p-3.5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
            {status === "upcoming" || status === "live" ? "Slot" : "Placement"}
          </p>
          <p
            className={`mt-2 break-words font-display uppercase leading-[0.9] ${
              status === "upcoming" || status === "live"
                ? "text-xl md:text-2xl"
                : "text-xl md:text-2xl"
            } ${isWin ? "text-accent" : "text-white"}`}
          >
            {placementLabel}
          </p>
        </div>

        {prize !== null && prize > 0 && (
          <div className="public-card-accent min-w-0 rounded-[14px] border border-white/8 bg-white/[0.02] p-3.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Approx prize</p>
            <p className="mt-2 break-words font-display text-lg uppercase leading-[0.95] text-white md:text-xl">
              {formatPrize(prize)}
            </p>
          </div>
        )}
      </div>

      {isCompletedWin(tournament) && (
        <div className="mt-4 md:mt-5">
          <span className="tag tag-won">Won the title</span>
        </div>
      )}
    </article>
  );
}
