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
      <div className="utility-panel sticky top-24 z-20 mb-8 rounded-[28px] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative xl:min-w-[320px] xl:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or real name"
              className="w-full rounded-full border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted"
              id="player-search"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "active", "retired", "departed"] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
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
            className="rounded-full border border-white/10 bg-transparent px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-text-secondary outline-none"
          >
            <option value="all">All Eras</option>
            {eras.map((era) => (
              <option key={era.id} value={era.id}>
                {era.name} ({era.yearRange[0]}-{era.yearRange[1]})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-text-muted">
          <span>{filteredPlayers.length} players shown</span>
          {(statusFilter !== "all" || eraFilter !== "all" || searchQuery.trim()) && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setEraFilter("all");
                setSearchQuery("");
              }}
              className="rounded-full border border-white/10 px-3 py-2 text-text-secondary hover:text-white"
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
