"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { queryKeys } from "@/lib/query/keys";
import type { Tournament } from "@/data/types";

type DbTournamentRow = {
  id: string;
  name: string;
  year: number;
  month: number | null;
  tier: Tournament["tier"];
  placement: string | null;
  approx_price: number | null;
  is_win: boolean;
  status: "completed" | "upcoming" | "live";
  event_date: string | null;
  location: string | null;
  details: string | null;
  coach: string | null;
  analyst: string | null;
  tournament_rosters: Array<{ player_id: string }> | null;
};

function parsePlacement(value: string | null): number | string {
  if (!value) return "TBD";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function mapRow(row: DbTournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    month: row.month ?? undefined,
    tier: row.tier,
    placement: parsePlacement(row.placement),
    prize: row.approx_price,
    isWin: row.is_win,
    status: row.status,
    eventDate: row.event_date ?? undefined,
    location: row.location ?? undefined,
    details: row.details ?? undefined,
    coach: row.coach ?? undefined,
    analyst: row.analyst ?? undefined,
    roster:
      row.tournament_rosters?.map((e) => e.player_id) ?? undefined,
  };
}

async function fetchTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select(
      "id, name, year, month, tier, placement, approx_price, is_win, status, event_date, location, details, coach, analyst, tournament_rosters(player_id)"
    )
    .order("year", { ascending: false })
    .order("month", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return ((data as DbTournamentRow[]) ?? []).map(mapRow);
}

/**
 * Client-side hook that fetches tournament data from Supabase.
 *
 * - First visit: fetches from Supabase → persisted to localStorage.
 * - Return visits: restored from localStorage cache → zero network requests.
 *
 * Inherits `staleTime: Infinity` from global defaults so the query
 * never auto-refetches in the background.
 */
export function useTournamentData() {
  return useQuery({
    queryKey: queryKeys.tournaments.feed(),
    queryFn: fetchTournaments,
  });
}
