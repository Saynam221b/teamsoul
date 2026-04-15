"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { Era, Player } from "@/data/types";
import PlayerCard from "./PlayerCard";
import DynamicFilterDock from "@/components/shared/DynamicFilterDock";

type FilterStatus = "all" | "active" | "retired" | "departed";

interface PlayerGridProps {
  players: Player[];
  eras: Era[];
}

export default function PlayerGrid({ players, eras }: PlayerGridProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [eraFilter, setEraFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredPlayers = useMemo(() => {
    let result: Player[] = players;

    if (statusFilter !== "all") {
      result = result.filter((player) => player.currentStatus === statusFilter);
    }

    if (eraFilter !== "all") {
      result = result.filter((player) => player.stints.some((stint) => stint.era === eraFilter));
    }

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase();
      result = result.filter(
        (player) =>
          player.displayName.toLowerCase().includes(query) ||
          player.realName.toLowerCase().includes(query) ||
          player.role.toLowerCase().includes(query)
      );
    }

    return result;
  }, [players, deferredSearchQuery, eraFilter, statusFilter]);

  const summaryLabel = useMemo(() => {
    const parts: string[] = [];

    if (statusFilter !== "all") {
      parts.push(statusFilter);
    }

    if (eraFilter !== "all") {
      const activeEra = eras.find((era) => era.id === eraFilter);
      parts.push(activeEra?.name ?? eraFilter);
    }

    if (searchQuery.trim()) {
      parts.push(`"${searchQuery.trim()}"`);
    }

    return `Active: ${parts.length ? parts.join(" / ") : "All players"}`;
  }, [eraFilter, eras, searchQuery, statusFilter]);

  const hasActiveFilters =
    statusFilter !== "all" || eraFilter !== "all" || Boolean(searchQuery.trim());

  const resetFilters = () => {
    startTransition(() => {
      setStatusFilter("all");
      setEraFilter("all");
    });
    setSearchQuery("");
  };

  return (
    <div>
      <DynamicFilterDock
        summaryLabel={summaryLabel}
        resultsLabel={`${filteredPlayers.length} player${filteredPlayers.length !== 1 ? "s" : ""} shown`}
        footer={
          <>
            <p className="filter-footnote">
              Search, status, and era stay visible while the roster grid updates below.
            </p>
            {hasActiveFilters ? (
              <button onClick={resetFilters} className="filter-reset">
                Clear filters
              </button>
            ) : null}
          </>
        }
      >
        <div className="filter-layout filter-layout-roster">
          <label className="filter-field filter-field-search" htmlFor="player-search">
            <span className="filter-label">Search roster</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, role, or real name"
              className="filter-input"
              id="player-search"
            />
          </label>

          <div className="filter-field">
            <span className="filter-label">Player status</span>
            <div className="filter-scroll">
              {(["all", "active", "retired", "departed"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => startTransition(() => setStatusFilter(status))}
                  className={`filter-pill ${statusFilter === status ? "filter-pill-active" : "filter-pill-muted"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <label className="filter-field" htmlFor="player-era-filter">
            <span className="filter-label">Era</span>
            <select
              id="player-era-filter"
              value={eraFilter}
              onChange={(e) => startTransition(() => setEraFilter(e.target.value))}
              className="filter-select"
            >
              <option value="all">All Eras</option>
              {eras.map((era) => (
                <option key={era.id} value={era.id}>
                  {era.name} ({era.yearRange[0]}-{era.yearRange[1]})
                </option>
              ))}
            </select>
          </label>
        </div>
      </DynamicFilterDock>

      <div className="filter-results-shell bento-grid">
        {filteredPlayers.map((player, index) => (
          <PlayerCard key={player.id} player={player} index={index} />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="py-20 text-center text-sm leading-7 text-text-muted">
          No players match the current filters.
        </div>
      )}
    </div>
  );
}
