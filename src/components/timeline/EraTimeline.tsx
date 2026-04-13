"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { getEras } from "@/data/helpers";
import EraCard from "./EraCard";

export default function EraTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const eras = getEras();

  return (
    <section
      id="era-timeline"
      ref={containerRef}
      className="relative py-24 md:py-36 px-4"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-20"
      >
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
          The Journey
        </h2>
        <p className="mt-3 text-text-secondary text-sm max-w-lg mx-auto">
          From the founding five in December 2018 to the BGIS 2026
          championship — every strategic pivot, roster fracture, and triumphant
          rebuild.
        </p>
      </motion.div>

      {/* Vertical Timeline */}
      <div className="relative max-w-3xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border-subtle md:-translate-x-px" />

        {/* Era Cards along the line */}
        <div className="space-y-16">
          {eras.map((era, index) => (
            <div
              key={era.id}
              className={`relative flex items-start gap-8 ${
                index % 2 === 0
                  ? "md:flex-row"
                  : "md:flex-row-reverse"
              }`}
            >
              {/* Dot milestone */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent border-2 border-background z-10 mt-6" />

              {/* Spacer for dot on mobile */}
              <div className="w-8 shrink-0 md:hidden" />

              {/* Card (half-width on desktop) */}
              <div className="flex-1 md:w-[calc(50%-2rem)]">
                <EraCard era={era} index={index} />
              </div>

              {/* Invisible spacer for alternation on desktop */}
              <div className="hidden md:block flex-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
