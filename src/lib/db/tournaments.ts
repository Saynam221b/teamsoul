import type { Tournament } from "@/data/types";
import { getAllTournaments } from "@/data/helpers";
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
  };
}

export async function getTournamentsFromDb(): Promise<Tournament[]> {
  if (!isSupabaseConfigured()) {
    return getAllTournaments().map((item) => ({ ...item, status: "completed" as const }));
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return getAllTournaments().map((item) => ({ ...item, status: "completed" as const }));
  }

  const { data, error } = await client
    .from("tournaments")
    .select("id,name,year,month,tier,placement,approx_price,is_win,status,event_date,location,details")
    .order("year", { ascending: false })
    .order("month", { ascending: false, nullsFirst: false });

  if (error || !data) {
    return getAllTournaments().map((item) => ({ ...item, status: "completed" as const }));
  }

  return (data as DbTournament[]).map(mapTournament);
}
