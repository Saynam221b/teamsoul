"use client";

import { getMajorWins } from "@/data/helpers";
import TrophyCard from "./TrophyCard";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

export default function TrophyRoom() {
  const majorWins = getMajorWins().slice(0, 5);

  return (
    <section id="trophy-room" className="archive-section trophy-room-section">
      <div className="page-wrap">
        <RevealOnScroll className="section-head max-w-3xl">
          <p className="section-kicker">Championship Wall</p>
          <h2 className="section-title">The Wins That Built The Standard</h2>
          <p className="section-copy">
            Five title runs sit at the center of the archive. This pass puts the squad, the support lane,
            and the competitive context back on the wall instead of reducing each win to a bare stat tile.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08} distance={20} intensity="soft">
          <div className="major-wins-stage">
            {majorWins.map((tournament, index) => (
              <TrophyCard key={tournament.id} tournament={tournament} index={index} featured={index < 2} />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
