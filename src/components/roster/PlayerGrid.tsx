"use client";

import { startTransition, useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Era, Player } from "@/data/types";
import PlayerCard from "./PlayerCard";
import DynamicFilterDock from "@/components/shared/DynamicFilterDock";

type FilterStatus = "all" | "active" | "retired" | "departed";

interface PlayerGridProps {
  players: Player[];
  eras: Era[];
}

export default function PlayerGrid({ players, eras }: PlayerGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const statusFilter: FilterStatus =
    statusParam === "active" || statusParam === "retired" || statusParam === "departed"
      ? statusParam
      : "all";
  const eraFilter = searchParams.get("era") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const updateFilters = (nextValues: {
    status: FilterStatus;
    era: string;
    query: string;
  }) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (nextValues.status === "all") {
      nextParams.delete("status");
    } else {
      nextParams.set("status", nextValues.status);
    }

    if (nextValues.era === "all") {
      nextParams.delete("era");
    } else {
      nextParams.set("era", nextValues.era);
    }

    if (nextValues.query.trim()) {
      nextParams.set("q", nextValues.query);
    } else {
      nextParams.delete("q");
    }

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;

    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

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
    updateFilters({ status: "all", era: "all", query: "" });
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
              onChange={(e) =>
                updateFilters({
                  status: statusFilter,
                  era: eraFilter,
                  query: e.target.value,
                })
              }
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
                  onClick={() =>
                    updateFilters({
                      status,
                      era: eraFilter,
                      query: searchQuery,
                    })
                  }
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
              onChange={(e) =>
                updateFilters({
                  status: statusFilter,
                  era: e.target.value,
                  query: searchQuery,
                })
              }
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

      <div className="filter-results-shell bento-grid route-results-grid route-results-grid-roster">
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
