"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPlayers, getEras } from "@/data/helpers";
import type { Player } from "@/data/types";
import PlayerCard from "./PlayerCard";

type FilterStatus = "all" | "active" | "retired" | "departed";

export default function PlayerGrid() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [eraFilter, setEraFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allPlayers = getAllPlayers();
  const eras = getEras();

  const filteredPlayers = useMemo(() => {
    let result: Player[] = allPlayers;

    if (statusFilter !== "all") {
      result = result.filter((p) => p.currentStatus === statusFilter);
    }

    if (eraFilter !== "all") {
      result = result.filter((p) =>
        p.stints.some((s) => s.era === eraFilter)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.realName.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allPlayers, statusFilter, eraFilter, searchQuery]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full text-sm bg-surface-card text-text-primary border border-border-subtle rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent/40 placeholder:text-text-muted transition-colors"
            id="player-search"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-surface-card border border-border-subtle rounded-xl">
          {(["all", "active", "retired", "departed"] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  text-[11px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors
                  ${statusFilter === status
                    ? "bg-accent-dim text-accent"
                    : "text-text-muted hover:text-text-secondary"
                  }
                `}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Era Filter */}
        <select
          value={eraFilter}
          onChange={(e) => setEraFilter(e.target.value)}
          className="text-xs bg-surface-card text-text-secondary border border-border-subtle rounded-xl px-3 py-2 focus:outline-none focus:border-accent/40"
        >
          <option value="all">All Eras</option>
          {eras.map((era) => (
            <option key={era.id} value={era.id}>
              {era.name} ({era.yearRange[0]}-{era.yearRange[1]})
            </option>
          ))}
        </select>
      </div>

      {/* Player Count */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-text-muted">
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
        </span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      {/* Player Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${statusFilter}-${eraFilter}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredPlayers.map((player, i) => (
            <PlayerCard key={player.id} player={player} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-20">
          <span className="text-sm text-text-muted">
            No players match the current filters.
          </span>
        </div>
      )}
    </div>
  );
}
