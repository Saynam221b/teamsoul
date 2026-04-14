"use client";

import Image from "next/image";
import { startTransition, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { getEras, getPlayerById, getStaffById } from "@/data/helpers";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import { EASE_PREMIUM, MOTION_TIMINGS } from "@/lib/motion";

function formatEraProgress(value: number) {
  return value.toString().padStart(2, "0");
}

function EraScrollHelper({
  instruction,
  progressLabel,
  className = "",
}: {
  instruction: string;
  progressLabel: string;
  className?: string;
}) {
  return (
    <div className={`era-story-helper ${className}`.trim()} aria-label={`${instruction} ${progressLabel}`}>
      <p className="era-story-helper-copy">{instruction}</p>
      <p className="era-story-helper-progress" aria-live="polite">
        {progressLabel}
      </p>
    </div>
  );
}

export default function EraTimeline() {
  const eras = getEras();
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const totalEras = formatEraProgress(eras.length);
  const activeProgressLabel = `${formatEraProgress(activeIndex + 1)} / ${totalEras}`;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextIndex = Math.min(eras.length - 1, Math.max(0, Math.floor(latest * eras.length)));

    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      startTransition(() => setActiveIndex(nextIndex));
    }
  });

  if (prefersReducedMotion) {
    return (
      <section id="era-timeline" className="archive-section era-story-section">
        <div className="page-wrap">
          <RevealOnScroll className="section-head max-w-3xl">
            <p className="section-kicker">Team Legacy</p>
            <h2 className="section-title">Team Legacy</h2>
            <p className="section-copy">
              Every era pushed the story further. The reduced-motion version keeps the same pacing and
              modern-era context without the sticky transition system.
            </p>
          </RevealOnScroll>

          <div className="era-story-helper-rail era-story-helper-rail-static">
            <EraScrollHelper instruction="Scroll for story" progressLabel={`${eras.length} chapters`} />
          </div>

          <div className="space-y-6">
            {eras.map((era, index) => {
              const staff = (era.staff ?? [])
                .map((id) => getStaffById(id))
                .filter((member): member is NonNullable<typeof member> => Boolean(member));

              return (
                <RevealOnScroll
                  key={era.id}
                  as="article"
                  delay={Math.min(index * 0.05, 0.2)}
                  className="timeline-era-row public-card rounded-[28px] p-6 md:p-8"
                >
                  {era.storyImageUrl ? (
                    <figure className="era-story-inline-media">
                      <Image
                        src={era.storyImageUrl}
                        alt={era.storyImageAlt ?? `${era.name} lineup`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </figure>
                  ) : null}
                  <p className="text-[11px] uppercase tracking-[0.26em] text-text-muted">
                    {era.yearRange[0]}-{era.yearRange[1]}
                  </p>
                  <h3 className="mt-4 font-display text-4xl uppercase leading-[0.86] tracking-[-0.05em] text-white md:text-6xl">
                    {era.name}
                  </h3>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-text-secondary">{era.description}</p>
                  {staff.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {staff.map((member) => (
                        <span
                          key={member.id}
                          className="rounded-full border border-accent/18 bg-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-accent"
                        >
                          {member.displayName} · {member.role}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-8 max-w-xl border-l border-border-subtle pl-5 text-sm uppercase tracking-[0.16em] text-text-muted">
                    {era.definingMoment}
                  </p>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  const activeEra = eras[activeIndex];
  const activePlayers = activeEra.keyPlayers
    .map((id) => getPlayerById(id))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));
  const activeStaff = (activeEra.staff ?? [])
    .map((id) => getStaffById(id))
    .filter((member): member is NonNullable<typeof member> => Boolean(member));

  return (
    <section id="era-timeline" className="archive-section era-story-section">
      <div className="page-wrap">
        <RevealOnScroll className="section-head max-w-3xl">
          <p className="section-kicker">Team Legacy</p>
          <h2 className="section-title">Team Legacy</h2>
          <p className="section-copy">
            Every era pushed the story further. Scroll the chapter rail and the active phase takes the
            canvas alone, with the modern rebuild explicitly carrying Manya, NakuL, and Ayogi into view.
          </p>
        </RevealOnScroll>

        <div
          ref={trackRef}
          className="era-story-track"
          style={{ "--era-count": eras.length } as CSSProperties}
        >
          <div className="era-story-stage">
            <aside className="era-story-rail">
              {eras.map((era, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={era.id}
                    className={`era-story-marker transition-all duration-300 ${
                      isActive ? "border-accent/40 opacity-100" : "opacity-35"
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-[0.24em] text-text-muted">
                      {era.yearRange[0]}-{era.yearRange[1]}
                    </span>
                    <p
                      className={`mt-2 font-display text-xl uppercase leading-none md:text-2xl ${
                        isActive ? "text-white" : "text-text-secondary"
                      }`}
                    >
                      {era.name}
                    </p>
                  </div>
                );
              })}
            </aside>

            <div className="era-story-main">
              <div className="era-story-helper-rail">
                <EraScrollHelper instruction="Scroll for story" progressLabel={activeProgressLabel} />
              </div>

              <div className="era-story-canvas">
                <AnimatePresence mode="wait">
                  <motion.article
                    key={activeEra.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: MOTION_TIMINGS.base, ease: EASE_PREMIUM }}
                    className="era-story-phase"
                  >
                    <div className="era-story-layout">
                      <div className="era-story-copy">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                          {activeEra.yearRange[0]}-{activeEra.yearRange[1]}
                        </p>
                        <h3 className="mt-5 font-display text-[clamp(2.5rem,5.8vw,5.6rem)] uppercase leading-[0.84] tracking-[-0.065em] text-white">
                          {activeEra.name}
                        </h3>
                        <p className="mt-5 max-w-[40rem] text-[0.97rem] leading-7 text-text-secondary md:text-[1.02rem] md:leading-8">
                          {activeEra.description}
                        </p>

                        <div className="mt-6 flex max-w-[42rem] flex-wrap gap-2">
                          {activePlayers.map((player) => (
                            <span
                              key={player.id}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-text-secondary"
                            >
                              {player.displayName}
                            </span>
                          ))}
                          {activeStaff.map((member) => (
                            <span
                              key={member.id}
                              className="rounded-full border border-accent/18 bg-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-accent"
                            >
                              {member.displayName} · {member.role}
                            </span>
                          ))}
                        </div>

                        <p className="mt-7 max-w-[36rem] border-l border-border-subtle pl-4 text-[0.82rem] uppercase tracking-[0.15em] text-text-muted md:text-[0.92rem]">
                          {activeEra.definingMoment}
                        </p>
                      </div>

                      <div className="era-story-visual">
                        {activeEra.storyImageUrl ? (
                          <figure className="era-story-media">
                            <Image
                              src={activeEra.storyImageUrl}
                              alt={activeEra.storyImageAlt ?? `${activeEra.name} lineup`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1199px) 100vw, 42vw"
                              priority={activeIndex === 0}
                            />
                          </figure>
                        ) : (
                          <div className="era-story-media era-story-media-fallback">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                              Story image pending
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
