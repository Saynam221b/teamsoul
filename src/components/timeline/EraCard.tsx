"use client";

import { motion } from "framer-motion";
import type { Era } from "@/data/types";
import { getPlayerById } from "@/data/helpers";
import Card from "../shared/GlassCard";

interface EraCardProps {
  era: Era;
  index: number;
}

const OUTCOME_STYLES: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  triumph: { color: "text-emerald-400", bg: "bg-emerald-400/8", label: "TRIUMPH" },
  decline: { color: "text-red-400", bg: "bg-red-400/8", label: "DECLINE" },
  rebuild: { color: "text-amber-400", bg: "bg-amber-400/8", label: "REBUILD" },
  dominance: { color: "text-sky-400", bg: "bg-sky-400/8", label: "DOMINANCE" },
};

export default function EraCard({ era, index }: EraCardProps) {
  const style = OUTCOME_STYLES[era.outcome] || OUTCOME_STYLES.rebuild;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="h-full flex flex-col">
        {/* Era Number + Year Range */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-text-muted uppercase tracking-widest">
            Era {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-xs font-medium text-accent">
            {era.yearRange[0]}–{era.yearRange[1]}
          </span>
        </div>

        {/* Era Name */}
        <h3 className="font-display text-lg font-bold text-text-primary mb-2 leading-tight">
          {era.name}
        </h3>

        {/* Outcome Badge */}
        <span
          className={`tag w-fit mb-3 ${style.bg} ${style.color}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {style.label}
        </span>

        {/* Description */}
        <p className="text-text-secondary text-xs leading-relaxed mb-4 flex-1">
          {era.description}
        </p>

        {/* Key Players */}
        <div className="pt-3 border-t border-border-subtle">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Key Roster
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {era.keyPlayers.slice(0, 5).map((playerId) => {
              const player = getPlayerById(playerId);
              return (
                <span
                  key={playerId}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-surface-elevated text-text-secondary"
                >
                  {player?.displayName || playerId}
                </span>
              );
            })}
          </div>
        </div>

        {/* Defining Moment */}
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Defining Moment
          </span>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {era.definingMoment}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
