"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getAllTournaments, getWins, getYears } from "@/data/helpers";
import type { Tournament } from "@/data/types";
import TournamentCard from "./TournamentCard";
import { EASE_PREMIUM, MOTION_TIMINGS } from "@/lib/motion";
import DynamicFilterDock from "@/components/shared/DynamicFilterDock";

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
  const prefersReducedMotion = useReducedMotion();
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
    () => source.filter((item) => item.status !== "upcoming" && item.status !== "live"),
    [source]
  );

  const ongoingTournaments = useMemo(
    () => source.filter((item) => item.status === "live"),
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

  const summaryLabel = useMemo(() => {
    const parts = [TABS.find((tab) => tab.id === activeTab)?.label ?? "Championships"];

    if (tierFilter !== "All") {
      parts.push(tierFilter);
    }

    if (yearFilter !== null) {
      parts.push(String(yearFilter));
    }

    return `Active: ${parts.join(" / ")}`;
  }, [activeTab, tierFilter, yearFilter]);

  const hasActiveFilters = activeTab !== "championships" || tierFilter !== "All" || yearFilter !== null;

  const resetFilters = () => {
    setActiveTab("championships");
    setTierFilter("All");
    setYearFilter(null);
  };

  return (
    <div>
      <section className="archive-panel public-card mb-5 rounded-[24px] p-5 md:mb-6 md:rounded-[32px] md:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/8 pb-4 md:mb-5 md:gap-4 md:pb-5">
          <div>
            <p className="section-kicker">Ongoing right now</p>
            <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
              Live campaigns
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted md:text-xs md:tracking-[0.22em]">
            {ongoingTournaments.length} active
          </span>
        </div>

        {ongoingTournaments.length > 0 ? (
          <div className="results-grid">
            {ongoingTournaments.map((item, index) => (
              <TournamentCard key={item.id} tournament={item} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-7 text-text-muted">No ongoing right now.</p>
        )}
      </section>

      <section className="archive-panel public-card mb-6 rounded-[24px] p-5 md:mb-8 md:rounded-[32px] md:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/8 pb-4 md:mb-5 md:gap-4 md:pb-5">
          <div>
            <p className="section-kicker">Upcoming events</p>
            <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
              What&apos;s next
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted md:text-xs md:tracking-[0.22em]">
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

      <DynamicFilterDock
        summaryLabel={summaryLabel}
        resultsLabel={`${filteredTournaments.length} result${filteredTournaments.length !== 1 ? "s" : ""}`}
        footer={
          <>
            <p className="filter-footnote">
              View, tier, and year stay pinned so the archive can be scanned without losing context.
            </p>
            {hasActiveFilters ? (
              <button onClick={resetFilters} className="filter-reset">
                Clear filters
              </button>
            ) : null}
          </>
        }
      >
        <div className="filter-layout filter-layout-tournaments">
          <div className="filter-field filter-field-wide">
            <span className="filter-label">View</span>
            <div className="filter-scroll">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTierFilter("All");
                    setYearFilter(null);
                  }}
                  className={`filter-pill ${activeTab === tab.id ? "filter-pill-active" : "filter-pill-muted"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-field filter-field-wide">
            <span className="filter-label">Tier</span>
            <div className="filter-scroll">
              {TIER_FILTERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`filter-pill ${tierFilter === tier ? "filter-pill-accent" : "filter-pill-muted"}`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {activeTab !== "championships" ? (
            <label className="filter-field" htmlFor="tournament-year-filter">
              <span className="filter-label">Year</span>
              <select
                id="tournament-year-filter"
                value={yearFilter ?? ""}
                onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                className="filter-select"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </DynamicFilterDock>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${tierFilter}-${yearFilter}`}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
          transition={{ duration: prefersReducedMotion ? MOTION_TIMINGS.fast : MOTION_TIMINGS.base, ease: EASE_PREMIUM }}
          className="filter-results-shell"
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
