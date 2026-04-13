"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function TournamentDash() {
  const [activeTab, setActiveTab] = useState<TabId>("championships");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const allTournaments = getAllTournaments();
  const wins = getWins();
  const years = getYears();

  const filteredTournaments = useMemo(() => {
    let base: Tournament[];

    switch (activeTab) {
      case "championships":
        base = wins;
        break;
      case "all":
      case "by-year":
      default:
        base = allTournaments;
    }

    if (tierFilter !== "All") {
      base = base.filter((t) => t.tier === tierFilter);
    }

    if (yearFilter !== null) {
      base = base.filter((t) => t.year === yearFilter);
    }

    return base;
  }, [activeTab, tierFilter, yearFilter, allTournaments, wins]);

  // Group by year for "By Year" tab
  const groupedByYear = useMemo(() => {
    if (activeTab !== "by-year") return null;
    const groups: Record<number, Tournament[]> = {};
    filteredTournaments.forEach((t) => {
      if (!groups[t.year]) groups[t.year] = [];
      groups[t.year].push(t);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, tournaments]) => ({
        year: Number(year),
        tournaments,
      }));
  }, [activeTab, filteredTournaments]);

  return (
    <div>
      {/* Tabs — Clean underline style */}
      <div className="flex items-center gap-0 mb-8 border-b border-border-subtle">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setTierFilter("All");
              setYearFilter(null);
            }}
            id={`tab-${tab.id}`}
            className={`
              relative px-5 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Tier Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIER_FILTERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`
                text-[11px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors
                ${tierFilter === tier
                  ? "bg-accent-dim text-accent border border-accent/20"
                  : "bg-surface-card text-text-muted border border-border-subtle hover:text-text-secondary"
                }
              `}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Year Filter */}
        {activeTab !== "championships" && (
          <select
            value={yearFilter ?? ""}
            onChange={(e) =>
              setYearFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="text-xs bg-surface-card text-text-secondary border border-border-subtle rounded-md px-3 py-1.5 focus:outline-none focus:border-accent/40"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        {/* Result Count */}
        <span className="text-xs text-text-muted self-center ml-auto">
          {filteredTournaments.length} result{filteredTournaments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tournament Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${tierFilter}-${yearFilter}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "by-year" && groupedByYear ? (
            // Grouped by year
            <div className="space-y-12">
              {groupedByYear.map(({ year, tournaments }) => (
                <div key={year}>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-display text-2xl font-bold text-text-primary">
                      {year}
                    </h3>
                    <div className="flex-1 h-px bg-border-subtle" />
                    <span className="text-xs text-text-muted">
                      {tournaments.length} tournaments
                    </span>
                  </div>
                  <div className="bento-grid">
                    {tournaments.map((t, i) => (
                      <TournamentCard
                        key={t.id}
                        tournament={t}
                        index={i}
                        featured={t.isWin && (t.tier === "A-Tier" || t.tier === "S-Tier")}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat grid
            <div className="bento-grid">
              {filteredTournaments.map((t, i) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  index={i}
                  featured={t.isWin && (t.tier === "A-Tier" || t.tier === "S-Tier")}
                />
              ))}
            </div>
          )}

          {filteredTournaments.length === 0 && (
            <div className="text-center py-20">
              <span className="text-sm text-text-muted">
                No tournaments match the current filters.
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
