"use client";

import { motion } from "framer-motion";
import { getWins } from "@/data/helpers";
import TrophyCard from "./TrophyCard";
import StatCounter from "../shared/StatCounter";

export default function TrophyRoom() {
  const wins = getWins();

  // Separate major wins (A-Tier+) from minor wins
  const majorWins = wins.filter(
    (w) => w.tier === "S-Tier" || w.tier === "A-Tier"
  );
  const otherWins = wins.filter(
    (w) => w.tier !== "S-Tier" && w.tier !== "A-Tier"
  );

  const totalWinPrize = wins.reduce((sum, w) => sum + (w.prize ?? 0), 0);

  return (
    <section id="trophy-room" className="py-24 md:py-36 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
            Championships
          </h2>
          <p className="mt-3 text-text-secondary text-sm max-w-lg mx-auto">
            Every 1st place finish. Every championship trophy. The complete
            record of Team SouL&apos;s competitive victories.
          </p>
        </motion.div>

        {/* Win Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-14 mb-16"
        >
          <StatCounter
            value={wins.length}
            label="Total Victories"
          />
          <StatCounter
            value={totalWinPrize}
            prefix="$"
            label="Prize from Wins"
          />
        </motion.div>

        {/* Major Wins */}
        {majorWins.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="font-display text-xl font-bold text-text-primary">
                Major Championships
              </h3>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {majorWins.map((t, i) => (
                <TrophyCard key={t.id} tournament={t} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Other Wins */}
        {otherWins.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="font-display text-xl font-bold text-text-primary">
                All Victories
              </h3>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherWins.map((t, i) => (
                <TrophyCard key={t.id} tournament={t} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
