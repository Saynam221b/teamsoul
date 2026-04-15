import type {
  AdminPlayerOption,
  AdminTournament,
  CompleteTournamentInput,
  CreateUpcomingTournamentInput,
  Tournament,
  UpdateTournamentInput,
} from "@/data/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { isCuratedTrophyTournament } from "@/lib/curatedTournaments";
import { normalizeTournamentLifecycleInput } from "@/lib/tournamentLifecycle";

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
  tournament_rosters?: Array<{ player_id: string }>;
};

const VALID_TIERS: Tournament["tier"][] = [
  "S-Tier",
  "A-Tier",
  "B-Tier",
  "C-Tier",
  "Qualifier",
  "Showmatch",
];

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }

  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error("Supabase admin client unavailable");
  }

  return client;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function dedupeIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

function parseOptionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Invalid numeric value");
  }
  return parsed;
}

function parseOptionalMonth(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const month = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  return month;
}

function parseRequiredYear(value: number | string | null | undefined) {
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < 2018 || year > 2100) {
    throw new Error("Year must be a valid 4-digit value");
  }
  return year;
}

function parseDateParts(eventDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate);
  if (!match) {
    throw new Error("Event date must use YYYY-MM-DD");
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function ensureTier(value: string): Tournament["tier"] {
  if (!VALID_TIERS.includes(value as Tournament["tier"])) {
    throw new Error("Tournament tier is invalid");
  }

  return value as Tournament["tier"];
}

function normalizeBaseTournamentInput(
  input: CreateUpcomingTournamentInput | UpdateTournamentInput
) {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("Tournament name is required");
  }

  const tier = ensureTier(input.tier);
  const eventDate = input.eventDate?.trim() ? input.eventDate.trim() : null;
  const derived = eventDate ? parseDateParts(eventDate) : null;
  const year = derived ? derived.year : parseRequiredYear(input.year);
  const month = derived ? derived.month : parseOptionalMonth(input.month);

  return {
    name,
    tier,
    year,
    month,
    eventDate,
    location: input.location?.trim() || null,
    details: input.details?.trim() || null,
    coach: input.coach?.trim() || null,
    analyst: input.analyst?.trim() || null,
    approxPrice: parseOptionalNumber(input.approxPrize),
  };
}

function normalizeRosterIds(rosterIds?: string[]) {
  return dedupeIds((rosterIds ?? []).map((value) => value.trim()));
}

function mapAdminTournament(row: DbTournamentRow): AdminTournament {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    month: row.month,
    tier: row.tier,
    placement: row.placement,
    approxPrize: row.approx_price,
    isWin: row.is_win,
    status: row.status,
    eventDate: row.event_date,
    location: row.location,
    details: row.details,
    coach: row.coach,
    analyst: row.analyst,
    rosterIds: (row.tournament_rosters ?? []).map((item) => item.player_id),
  };
}

async function replaceTournamentRoster(tournamentId: string, rosterIds: string[]) {
  const client = ensureSupabase();
  const uniqueRosterIds = normalizeRosterIds(rosterIds);

  const { error: deleteError } = await client
    .from("tournament_rosters")
    .delete()
    .eq("tournament_id", tournamentId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!uniqueRosterIds.length) return;

  const rows = uniqueRosterIds.map((playerId) => ({
    id: `tour_roster__${tournamentId}__${playerId}`.toLowerCase(),
    tournament_id: tournamentId,
    player_id: playerId,
  }));

  const { error } = await client.from("tournament_rosters").upsert(rows, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }
}

async function generateTournamentId(name: string, year: number) {
  const client = ensureSupabase();
  const baseId = `${slugify(name)}-${year}`;
  let candidate = baseId;
  let suffix = 2;

  // Keep the ID stable and readable while avoiding collisions.
  for (;;) {
    const { data, error } = await client
      .from("tournaments")
      .select("id")
      .eq("id", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }
}

async function getTournamentStatus(id: string): Promise<DbTournamentRow["status"]> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("tournaments")
    .select("status")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not load tournament status");
  }

  return data.status as DbTournamentRow["status"];
}

export async function listAdminTournaments(): Promise<AdminTournament[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const client = ensureSupabase();
  const { data, error } = await client
    .from("tournaments")
    .select(
      "id,name,year,month,tier,placement,approx_price,is_win,status,event_date,location,details,coach,analyst,tournament_rosters(player_id)"
    )
    .order("year", { ascending: false })
    .order("month", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DbTournamentRow[]).map(mapAdminTournament);
}

export async function listAdminPlayers(): Promise<AdminPlayerOption[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const client = ensureSupabase();
  const { data, error } = await client
    .from("players")
    .select("id,display_name,role,current_status,is_active")
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((player) => ({
    id: String(player.id),
    displayName: String(player.display_name),
    role: String(player.role ?? "Player"),
    currentStatus: player.current_status as AdminPlayerOption["currentStatus"],
    isActive: Boolean(player.is_active),
  }));
}

export async function createUpcomingTournament(input: CreateUpcomingTournamentInput) {
  const client = ensureSupabase();
  const normalized = normalizeBaseTournamentInput(input);
  const id = await generateTournamentId(normalized.name, normalized.year);
  const lifecycle = normalizeTournamentLifecycleInput({
    status: input.status === "live" ? "live" : "upcoming",
    placement: null,
    isWin: false,
    rosterIds: [],
  });

  const { data, error } = await client
    .from("tournaments")
    .insert({
      id,
      name: normalized.name,
      year: normalized.year,
      month: normalized.month,
      tier: normalized.tier,
      placement: lifecycle.placement,
      approx_price: normalized.approxPrice,
      is_win: lifecycle.isWin,
      status: lifecycle.status,
      event_date: normalized.eventDate,
      location: normalized.location,
      details: normalized.details,
      coach: normalized.coach,
      analyst: normalized.analyst,
    })
    .select(
      "id,name,year,month,tier,placement,approx_price,is_win,status,event_date,location,details,coach,analyst,tournament_rosters(player_id)"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create tournament");
  }

  return mapAdminTournament(data as DbTournamentRow);
}

export async function updateTournament(id: string, input: UpdateTournamentInput) {
  const client = ensureSupabase();
  const normalized = normalizeBaseTournamentInput(input);
  const rosterIds = input.rosterIds ? normalizeRosterIds(input.rosterIds) : null;
  const requestedStatus =
    input.status === "live" || input.status === "upcoming" || input.status === "completed"
      ? input.status
      : undefined;
  const status = requestedStatus ?? (await getTournamentStatus(id));
  const lifecycle = normalizeTournamentLifecycleInput({
    status,
    placement: input.placement?.trim() || null,
    isWin: Boolean(input.isWin),
    rosterIds: rosterIds ?? [],
  });

  const { data, error } = await client
    .from("tournaments")
    .update({
      name: normalized.name,
      year: normalized.year,
      month: normalized.month,
      tier: normalized.tier,
      placement: lifecycle.placement,
      approx_price: normalized.approxPrice,
      is_win: lifecycle.isWin,
      status: lifecycle.status,
      event_date: normalized.eventDate,
      location: normalized.location,
      details: normalized.details,
      coach: normalized.coach,
      analyst: normalized.analyst,
    })
    .eq("id", id)
    .select(
      "id,name,year,month,tier,placement,approx_price,is_win,status,event_date,location,details,coach,analyst,tournament_rosters(player_id)"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update tournament");
  }

  if (lifecycle.status === "completed") {
    if (rosterIds) {
      await replaceTournamentRoster(id, lifecycle.rosterIds);
    }
  } else {
    await replaceTournamentRoster(id, []);
  }

  const refreshed = await listAdminTournaments();
  const updated = refreshed.find((item) => item.id === id);
  if (!updated) {
    throw new Error("Tournament update could not be verified");
  }

  return updated;
}

export async function completeTournament(id: string, input: CompleteTournamentInput) {
  const client = ensureSupabase();
  const normalized = normalizeBaseTournamentInput(input);
  const lifecycle = normalizeTournamentLifecycleInput({
    status: "completed",
    placement: input.placement?.trim() || null,
    isWin: Boolean(input.isWin),
    rosterIds: normalizeRosterIds(input.rosterIds),
  });
  if (!lifecycle.placement) {
    throw new Error("Placement is required to complete a tournament");
  }
  if (!lifecycle.rosterIds.length) {
    throw new Error("Select at least one roster player");
  }

  const { data, error } = await client
    .from("tournaments")
    .update({
      name: normalized.name,
      year: normalized.year,
      month: normalized.month,
      tier: normalized.tier,
      placement: lifecycle.placement,
      approx_price: normalized.approxPrice,
      is_win: lifecycle.isWin,
      status: lifecycle.status,
      event_date: normalized.eventDate,
      location: normalized.location,
      details: normalized.details,
      coach: normalized.coach,
      analyst: normalized.analyst,
    })
    .eq("id", id)
    .select(
      "id,name,year,month,tier,placement,approx_price,is_win,status,event_date,location,details,coach,analyst,tournament_rosters(player_id)"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not complete tournament");
  }

  await replaceTournamentRoster(id, lifecycle.rosterIds);

  const refreshed = await listAdminTournaments();
  const completed = refreshed.find((item) => item.id === id);
  if (!completed) {
    throw new Error("Tournament completion could not be verified");
  }

  return completed;
}

export async function deleteTournament(id: string) {
  if (isCuratedTrophyTournament(id)) {
    throw new Error("This tournament is curated on the trophy wall and cannot be deleted.");
  }

  const client = ensureSupabase();

  const { error: rosterError } = await client
    .from("tournament_rosters")
    .delete()
    .eq("tournament_id", id);
    
  if (rosterError) {
    throw new Error(rosterError.message);
  }

  const { error } = await client
    .from("tournaments")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Could not delete tournament");
  }

  return true;
}
