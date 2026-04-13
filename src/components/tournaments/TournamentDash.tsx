"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAllTournaments, getWins, getYears } from "@/data/helpers";
import type { Tournament } from "@/data/types";
import TournamentCard from "./TournamentCard";

type TabId = "championships" | "all" | "by-year";

const TABS: { id: TabId; label: string }[] = [
  { id: "championships", label: "Championships" },
  { id: "all", label: "All Results" },
  { id: "by-year", label: "By Year" },
];

const TIER_FILTERS = [
  "All",
  "S-Tier",
  "A-Tier",
  "B-Tier",
  "C-Tier",
  "Qualifier",
  "Showmatch",
] as const;

export default function TournamentDash({ tournaments }: { tournaments?: Tournament[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("championships");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const staticData = useMemo(
    () => getAllTournaments().map((item) => ({ ...item, status: "completed" as const })),
    []
  );

  const source = useMemo(
    () => (tournaments?.length ? tournaments : staticData),
    [tournaments, staticData]
  );

  const allTournaments = useMemo(
    () => source.filter((item) => item.status !== "upcoming"),
    [source]
  );

  const upcomingTournaments = useMemo(
    () => source.filter((item) => item.status === "upcoming"),
    [source]
  );

  const wins = useMemo(
    () => (tournaments?.length ? source : getWins()).filter((item) => item.isWin),
    [source, tournaments]
  );

  const years = useMemo(() => {
    if (!tournaments?.length) return getYears();
    return Array.from(new Set(allTournaments.map((item) => item.year))).sort((a, b) => a - b);
  }, [tournaments, allTournaments]);

  const filteredTournaments = useMemo(() => {
    let base: Tournament[] = activeTab === "championships" ? wins : allTournaments;

    if (tierFilter !== "All") {
      base = base.filter((item) => item.tier === tierFilter);
    }

    if (yearFilter !== null) {
      base = base.filter((item) => item.year === yearFilter);
    }

    return base;
  }, [activeTab, tierFilter, yearFilter, wins, allTournaments]);

  const groupedByYear = useMemo(() => {
    if (activeTab !== "by-year") return [];

    const groups = filteredTournaments.reduce<Record<number, Tournament[]>>((acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, items]) => ({ year: Number(year), tournaments: items }));
  }, [activeTab, filteredTournaments]);

  return (
    <div>
      <section className="archive-panel mb-8 rounded-[32px] p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/8 pb-5">
          <div>
            <p className="section-kicker">Upcoming events</p>
            <h2 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
              What&apos;s next
            </h2>
          </div>
          <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
            {upcomingTournaments.length} scheduled
          </span>
        </div>

        {upcomingTournaments.length > 0 ? (
          <div className="results-grid">
            {upcomingTournaments.map((item, index) => (
              <TournamentCard key={item.id} tournament={item} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-7 text-text-muted">No upcoming tournaments yet.</p>
        )}
      </section>

      <section className="utility-panel sticky top-24 z-20 mb-8 rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setTierFilter("All");
                  setYearFilter(null);
                }}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "border border-white/10 text-text-secondary hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            {TIER_FILTERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  tierFilter === tier
                    ? "bg-accent text-white"
                    : "border border-white/10 text-text-muted hover:text-white"
                }`}
              >
                {tier}
              </button>
            ))}

            {activeTab !== "championships" && (
              <select
                value={yearFilter ?? ""}
                onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-secondary outline-none"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-text-muted">
          {filteredTournaments.length} result{filteredTournaments.length !== 1 ? "s" : ""}
        </p>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${tierFilter}-${yearFilter}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "by-year" ? (
            <div className="space-y-10">
              {groupedByYear.map(({ year, tournaments: items }) => (
                <div key={year}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                      {year}
                    </h3>
                    <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
                      {items.length} tournaments
                    </span>
                  </div>
                  <div className="bento-grid">
                    {items.map((item, index) => (
                      <TournamentCard
                        key={item.id}
                        tournament={item}
                        index={index}
                        featured={item.isWin && (item.tier === "A-Tier" || item.tier === "S-Tier")}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bento-grid">
              {filteredTournaments.map((item, index) => (
                <TournamentCard
                  key={item.id}
                  tournament={item}
                  index={index}
                  featured={item.isWin && (item.tier === "A-Tier" || item.tier === "S-Tier")}
                />
              ))}
            </div>
          )}

          {filteredTournaments.length === 0 && (
            <div className="py-20 text-center text-sm leading-7 text-text-muted">
              No tournaments match the current filters.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
