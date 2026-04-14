"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      result = result.filter((player) => player.currentStatus === statusFilter);
    }

    if (eraFilter !== "all") {
      result = result.filter((player) => player.stints.some((stint) => stint.era === eraFilter));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (player) =>
          player.displayName.toLowerCase().includes(query) ||
          player.realName.toLowerCase().includes(query) ||
          player.role.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allPlayers, eraFilter, searchQuery, statusFilter]);

  return (
    <div>
      <div className="utility-panel sticky top-4 z-40 mb-6 rounded-[28px] p-3 md:top-6 md:p-4">
        <div className="flex flex-col gap-2 md:gap-3 xl:flex-row xl:items-center">
          <div className="relative xl:min-w-[280px] xl:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, role, or real name"
              className="w-full rounded-full border border-white/10 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-text-muted md:px-4 md:py-3 md:text-sm"
              id="player-search"
            />
          </div>

          <div className="filter-scroll">
            {(["all", "active", "retired", "departed"] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors md:px-4 md:py-2 md:tracking-[0.18em] ${
                  statusFilter === status
                    ? "bg-white text-black"
                    : "border border-white/10 text-text-secondary hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={eraFilter}
            onChange={(e) => setEraFilter(e.target.value)}
            className="shrink-0 rounded-full border border-white/10 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-text-secondary outline-none md:px-4 md:py-3 md:tracking-[0.18em]"
          >
            <option value="all">All Eras</option>
            {eras.map((era) => (
              <option key={era.id} value={era.id}>
                {era.name} ({era.yearRange[0]}-{era.yearRange[1]})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-text-muted md:mt-4 md:gap-3 md:text-xs md:tracking-[0.18em]">
          <span>{filteredPlayers.length} players shown</span>
          {(statusFilter !== "all" || eraFilter !== "all" || searchQuery.trim()) && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setEraFilter("all");
                setSearchQuery("");
              }}
              className="rounded-full border border-white/10 px-2.5 py-1.5 text-text-secondary hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${statusFilter}-${eraFilter}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bento-grid"
        >
          {filteredPlayers.map((player, index) => (
            <PlayerCard key={player.id} player={player} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredPlayers.length === 0 && (
        <div className="py-20 text-center text-sm leading-7 text-text-muted">
          No players match the current filters.
        </div>
      )}
    </div>
  );
}
