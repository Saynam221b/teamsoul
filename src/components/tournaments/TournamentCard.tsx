"use client";

import { motion } from "framer-motion";
import type { Tournament } from "@/data/types";
import { formatPrize, formatPlacement } from "@/data/helpers";
import Card from "../shared/GlassCard";
import TierBadge from "../shared/TierBadge";

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
  const { name, year, tier, placement, prize, isWin } = tournament;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
      className={featured ? "bento-featured" : ""}
    >
      <Card className="h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <TierBadge tier={tier} size="sm" />
          <span className="text-xs text-text-muted">{year}</span>
        </div>

        <h3
          className={`
            font-display text-sm md:text-base font-semibold leading-tight mb-3
            ${isWin ? "text-text-primary" : "text-text-secondary"}
          `}
        >
          {name}
        </h3>

        <div className="flex items-end justify-between mt-auto">
          {/* Placement */}
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">
              Placement
            </span>
            <span
              className={`
                font-display text-2xl font-bold
                ${isWin ? "text-accent" : "text-text-secondary"}
              `}
            >
              {typeof placement === "number"
                ? formatPlacement(placement)
                : placement}
            </span>
          </div>

          {/* Prize */}
          {prize !== null && prize > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">
                Prize
              </span>
              <span className="text-lg font-bold text-text-primary">
                {formatPrize(prize)}
              </span>
            </div>
          )}
        </div>

        {/* Win Indicator */}
        {isWin && (
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <span className="tag tag-won">
              ✓ Championship
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
