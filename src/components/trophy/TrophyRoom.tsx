"use client";

import { getWins } from "@/data/helpers";
import TrophyCard from "./TrophyCard";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

export default function TrophyRoom() {
  const wins = getWins();
  const headlineWins = wins.filter((w) => w.tier === "S-Tier" || w.tier === "A-Tier").slice(0, 3);
  const archiveWins = wins.filter((w) => w.tier !== "S-Tier" && w.tier !== "A-Tier").slice(0, 4);

  return (
    <section id="trophy-room" className="archive-section">
      <div className="page-wrap">
        <RevealOnScroll className="section-head">
          <p className="section-kicker">Championship Wall</p>
          <h2 className="section-title">Titles that made Team SOUL iconic</h2>
          <p className="section-copy">
            Some wins become part of the record. Others become part of the identity. These are the
            championships fans remember first.
          </p>
        </RevealOnScroll>

        <div className="space-y-12">
          <div>
            <RevealOnScroll className="mb-5 flex items-center justify-between gap-3">
              <h3 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                Headline titles
              </h3>
              <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
                Curated
              </span>
            </RevealOnScroll>
            <div className="results-grid">
              {headlineWins.map((tournament, index) => (
                <TrophyCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                  featured={index === 0}
                />
              ))}
            </div>
          </div>

          <div>
            <RevealOnScroll className="mb-5 flex items-center justify-between gap-3">
              <h3 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                Further title runs
              </h3>
              <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
                Selected
              </span>
            </RevealOnScroll>
            <div className="bento-grid">
              {archiveWins.map((tournament, index) => (
                <TrophyCard key={tournament.id} tournament={tournament} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
