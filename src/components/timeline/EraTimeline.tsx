"use client";

import { getEras } from "@/data/helpers";
import EraCard from "./EraCard";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

export default function EraTimeline() {
  const eras = getEras();

  return (
    <section id="era-timeline" className="archive-section">
      <div className="page-wrap">
        <RevealOnScroll className="section-head">
          <p className="section-kicker">Team Legacy</p>
          <h2 className="section-title">Every era pushed the story further</h2>
          <p className="section-copy">
            Team SOUL&apos;s journey is bigger than one roster or one title. These eras show how the
            identity evolved while the standard stayed the same.
          </p>
        </RevealOnScroll>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <RevealOnScroll as="div" delay={0.1}>
            <aside className="utility-panel rounded-[24px] p-5 lg:sticky lg:top-28 lg:h-fit">
              <p className="text-[11px] uppercase tracking-[0.24em] text-text-muted">Timeline</p>
              <div className="mt-6 space-y-4">
                {eras.map((era, index) => (
                  <div key={era.id} className="border-l border-border-subtle pl-4">
                    <p className="font-display text-3xl uppercase leading-none text-white">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-secondary">
                      {era.yearRange[0]}-{era.yearRange[1]}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">{era.name}</p>
                  </div>
                ))}
              </div>
            </aside>
          </RevealOnScroll>

          <div className="space-y-6">
            {eras.map((era, index) => (
              <EraCard key={era.id} era={era} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
