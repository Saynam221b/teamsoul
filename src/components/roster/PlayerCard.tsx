"use client";

import type { Player } from "@/data/types";
import { formatDate } from "@/data/helpers";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

interface PlayerCardProps {
  player: Player;
  index: number;
}

const STATUS_STYLES = {
  active: "text-accent",
  retired: "text-[#f3c76a]",
  departed: "text-text-secondary",
};

export default function PlayerCard({ player, index }: PlayerCardProps) {
  const latestStint = player.stints[player.stints.length - 1];

  return (
    <RevealOnScroll
      as="article"
      delay={Math.min(index * 0.04, 0.24)}
      distance={20}
      margin="-30px"
      className="archive-panel group rounded-[28px] p-5"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div
            className={`avatar-grayscale flex h-16 w-16 items-center justify-center rounded-full border font-display text-3xl uppercase ${
              player.isFounder
                ? "border-[#f3c76a]/30 bg-[#f3c76a]/10 text-[#f3c76a]"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            {player.displayName.slice(0, 2)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-4xl uppercase leading-none text-white">
                {player.displayName}
              </h3>
              {player.isFounder && (
                <span className="rounded-full border border-[#f3c76a]/30 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f3c76a]">
                  Founder
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-muted">{player.realName}</p>
          </div>
        </div>

        <span className={`text-[10px] uppercase tracking-[0.18em] ${STATUS_STYLES[player.currentStatus]}`}>
          {player.currentStatus}
        </span>
      </div>

      <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">Role</p>
      <p className="mt-2 text-base text-text-secondary">{player.role}</p>

      <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
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
        <div className="mt-5 border-t border-white/8 pt-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Awards</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {player.awards.slice(0, 3).map((award, awardIndex) => (
              <span
                key={`${player.id}-${awardIndex}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary"
              >
                {award.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 border-t border-white/8 pt-5 text-sm leading-7 text-text-secondary">
        {player.impact}
      </p>
    </RevealOnScroll>
  );
}
