"use client";

import { motion } from "framer-motion";
import type { Player } from "@/data/types";
import Card from "../shared/GlassCard";
import { formatDate } from "@/data/helpers";

interface PlayerCardProps {
  player: Player;
  index: number;
}

const STATUS_STYLES = {
  active: { color: "text-emerald-400", bg: "bg-emerald-400/8", dot: "bg-emerald-400" },
  retired: { color: "text-amber-400", bg: "bg-amber-400/8", dot: "bg-amber-400" },
  departed: { color: "text-text-muted", bg: "bg-white/5", dot: "bg-text-muted" },
};

export default function PlayerCard({ player, index }: PlayerCardProps) {
  const style = STATUS_STYLES[player.currentStatus];
  const latestStint = player.stints[player.stints.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
    >
      <Card hover className="h-full flex flex-col group">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`
              avatar-grayscale
              w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg font-bold
              ${player.isActive ? "bg-accent-dim text-accent" : "bg-surface-elevated text-text-muted"}
              ${player.isFounder ? "ring-1 ring-amber-500/20" : ""}
            `}
          >
            {player.displayName.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-text-primary truncate">
                {player.displayName}
              </h3>
              {player.isFounder && (
                <span className="text-[9px] font-medium text-amber-400 bg-amber-400/8 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Founder
                </span>
              )}
            </div>
            {player.realName && (
              <p className="text-xs text-text-muted truncate">{player.realName}</p>
            )}
          </div>
        </div>

        {/* Role & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-secondary">{player.role}</span>
          <span
            className={`tag ${style.bg} ${style.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {player.currentStatus}
          </span>
        </div>

        {/* Stint Info */}
        <div className="text-xs text-text-muted mb-3">
          <div className="flex justify-between">
            <span>Joined: {formatDate(latestStint.joinDate)}</span>
            <span>
              {latestStint.leaveDate
                ? `Left: ${formatDate(latestStint.leaveDate)}`
                : "Present"}
            </span>
          </div>
          {player.stints.length > 1 && (
            <span className="text-accent mt-1 block">
              {player.stints.length} stints
            </span>
          )}
        </div>

        {/* Awards */}
        {player.awards.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Awards ({player.awards.length})
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {player.awards.slice(0, 3).map((award, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/8 text-amber-400"
                >
                  {award.name}
                </span>
              ))}
              {player.awards.length > 3 && (
                <span className="text-[10px] text-text-muted">
                  +{player.awards.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Impact */}
        <p className="text-xs text-text-secondary leading-relaxed mt-auto line-clamp-3">
          {player.impact}
        </p>
      </Card>
    </motion.div>
  );
}
