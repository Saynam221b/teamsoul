"use client";

import type { Player } from "@/data/types";
import { formatDate } from "@/data/helpers";

interface PlayerCardProps {
  player: Player;
  index: number;
}

const STATUS_STYLES = {
  active: "text-accent",
  retired: "text-gold",
  departed: "text-text-secondary",
};

export default function PlayerCard({ player, index }: PlayerCardProps) {
  const latestStint = player.stints[player.stints.length - 1];

  return (
    <article
      className="archive-card-shell archive-panel public-card group rounded-[22px] p-4 md:rounded-[26px] md:p-5"
      style={{ animationDelay: `${Math.min(index * 24, 160)}ms` }}
    >
      <div className="mb-4 flex items-start justify-between gap-2 md:mb-5 md:gap-3">
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className={`avatar-grayscale public-card-accent-avatar flex h-11 w-11 items-center justify-center rounded-full border font-display text-xl uppercase md:h-16 md:w-16 md:text-3xl ${
              player.isFounder
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            {player.displayName.slice(0, 2)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <h3 className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                {player.displayName}
              </h3>
              {player.isFounder && (
                <span className="rounded-full border border-gold/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-gold md:py-1 md:text-[10px] md:tracking-[0.16em]">
                  Founder
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-text-muted md:mt-1 md:text-sm">{player.realName}</p>
          </div>
        </div>

        <span className={`text-[9px] uppercase tracking-[0.14em] md:text-[10px] md:tracking-[0.18em] ${STATUS_STYLES[player.currentStatus]}`}>
          {player.currentStatus}
        </span>
      </div>

      <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted md:text-[11px] md:tracking-[0.22em]">Role</p>
      <p className="mt-1 text-sm text-text-secondary md:mt-2 md:text-base">{player.role}</p>

      <div className="mt-4 grid gap-2 border-t border-white/8 pt-4 sm:grid-cols-2 md:mt-5 md:gap-3 md:pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Joined</p>
          <p className="mt-1 text-sm text-text-secondary">{formatDate(latestStint.joinDate)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Current</p>
          <p className="mt-1 text-sm text-text-secondary">
            {latestStint.leaveDate ? formatDate(latestStint.leaveDate) : "Active now"}
          </p>
        </div>
      </div>

      {player.awards.length > 0 && (
        <div className="mt-4 border-t border-white/8 pt-4 md:mt-5 md:pt-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Awards</p>
          <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
            {player.awards.slice(0, 3).map((award, awardIndex) => (
              <span
                key={`${player.id}-${awardIndex}`}
                className="public-card-accent rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-text-secondary md:px-3 md:py-1.5 md:text-xs md:tracking-[0.12em]"
              >
                {award.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-6 text-text-secondary md:mt-5 md:pt-5 md:text-sm md:leading-7">
        {player.impact}
      </p>
    </article>
  );
}
