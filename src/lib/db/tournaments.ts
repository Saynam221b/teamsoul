import type {
  PublicTournamentFeedResult,
  Tournament,
} from "@/data/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";

type DbTournament = {
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

function mapTournament(row: DbTournament): Tournament {
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
    roster: row.tournament_rosters?.map((entry) => entry.player_id) ?? undefined,
  };
}

function buildUnavailableFeed(message: string): PublicTournamentFeedResult {
  return {
    tournaments: [],
    source: "unavailable",
    message,
  };
}

export function getTournamentFeedUnavailableMessage(
  message?: string
): string {
  return message ?? "Tournament data is unavailable right now.";
}

export async function getPublicTournamentFeed(): Promise<PublicTournamentFeedResult> {
  if (!isSupabaseConfigured()) {
    return buildUnavailableFeed("Live tournament feed is not configured.");
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return buildUnavailableFeed("Live tournament feed could not initialize.");
  }

  const { data, error } = await client
    .from("tournaments")
    .select("id,name,year,month,tier,placement,approx_price,is_win,status,event_date,location,details,coach,analyst,tournament_rosters(player_id)")
    .order("year", { ascending: false })
    .order("month", { ascending: false, nullsFirst: false });

  if (error || !data) {
    return buildUnavailableFeed(
      `Live tournament feed is temporarily unavailable.${error?.message ? ` ${error.message}` : ""}`
    );
  }

  return {
    tournaments: (data as DbTournament[]).map(mapTournament),
    source: "db",
  };
}

export async function getTournamentsFromDb(): Promise<Tournament[]> {
  const result = await getPublicTournamentFeed();
  return result.tournaments;
}
