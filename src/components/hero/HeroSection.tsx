"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import StatCounter from "../shared/StatCounter";
import { getOrganization, getStats } from "@/data/helpers";

export default function HeroSection() {
  const org = getOrganization();
  const stats = getStats();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Subtle background gradient — barely visible */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(226, 29, 39, 0.04) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Logo — clean, no pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="relative w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-surface-card flex items-center justify-center border border-border-subtle">
          <Image
            src="/logo.png"
            alt="Team SouL Logo"
            width={160}
            height={160}
            className="object-contain p-4"
            priority
          />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-10 text-center"
      >
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-800 tracking-tight text-text-primary">
          A Legacy in Motion.
        </h1>
        <p className="mt-3 text-sm md:text-base text-text-muted tracking-[0.2em] uppercase">
          Team SouL · Est. 2018
        </p>
      </motion.div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-6 max-w-xl text-center text-text-secondary text-sm md:text-base leading-relaxed"
      >
        The definitive historical record of India&apos;s most storied mobile
        esports dynasty. From the founding five to the BGIS 2026 championship.
      </motion.p>

      {/* Stat Counters */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-14"
      >
        <StatCounter
          value={org.totalEarnings}
          prefix="$"
          label="Total Earnings"
        />
        <StatCounter
          value={stats.totalWins}
          label="Championships"
        />
        <StatCounter
          value={org.peakViewership}
          label="Peak Viewers"
        />
        <StatCounter
          value={org.totalTournaments}
          label="Tournaments"
        />
      </motion.div>

      {/* Scroll CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-text-muted uppercase tracking-widest">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-border-subtle flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}
