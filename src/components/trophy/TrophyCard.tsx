"use client";

import { motion } from "framer-motion";
import type { Tournament } from "@/data/types";
import { formatPrize, formatPlacement, getPlayerById } from "@/data/helpers";
import TierBadge from "../shared/TierBadge";
import Card from "../shared/GlassCard";

interface TrophyCardProps {
  tournament: Tournament;
  index: number;
}

export default function TrophyCard({ tournament, index }: TrophyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Card className="h-full group">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <TierBadge tier={tournament.tier} size="md" />
            <span className="text-xs text-text-muted">
              {tournament.year}
            </span>
          </div>

          {/* Tournament Name */}
          <h3 className="font-display text-lg md:text-xl font-bold text-text-primary mb-4 leading-tight">
            {tournament.name}
          </h3>

          {/* Placement & Prize */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                Placement
              </span>
              <span className="font-display text-3xl font-bold text-accent">
                {typeof tournament.placement === "number"
                  ? formatPlacement(tournament.placement)
                  : tournament.placement}
              </span>
            </div>
            {tournament.prize !== null && tournament.prize > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                  Prize Pool
                </span>
                <span className="font-display text-2xl font-bold text-text-primary">
                  {formatPrize(tournament.prize)}
                </span>
              </div>
            )}
          </div>

          {/* Roster */}
          {tournament.roster && tournament.roster.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                Championship Roster
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {tournament.roster.map((playerId) => {
                  const player = getPlayerById(playerId);
                  return (
                    <span
                      key={playerId}
                      className="text-xs px-2.5 py-1 rounded-md bg-surface-elevated text-text-secondary border border-border-subtle"
                    >
                      {player?.displayName || playerId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Won tag */}
          <div className="mt-4 flex items-center gap-2">
            <span className="tag tag-won">
              ✓ Won
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
