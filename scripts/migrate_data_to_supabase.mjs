import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function readEnv(content, key) {
  const line = content
    .split(/\r?\n/)
    .find((item) => item.startsWith(`${key}=`));
  if (!line) return "";
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^"(.*)"$/, "$1");
}

async function getEnvVar(name) {
  if (process.env[name]) return process.env[name];
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envContent = await readFile(envPath, "utf8");
  return readEnv(envContent, name);
}

function keyId(...parts) {
  return parts.filter(Boolean).join("__").toLowerCase().replace(/[^a-z0-9_]/g, "_");
}

const supabaseUrl = await getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const serviceRole = await getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRole) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false },
});

const dataPath = path.resolve(process.cwd(), "src/data/data.json");
const raw = await readFile(dataPath, "utf8");
const data = JSON.parse(raw);

async function upsert(table, rows, onConflict = "id") {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

const organization = {
  id: "team-soul",
  name: data.organization.name,
  founded: data.organization.founded,
  parent_org: data.organization.parentOrg,
  parent_org_formed: data.organization.parentOrgFormed,
  total_earnings: data.organization.totalEarnings,
  bgmi_earnings: data.organization.bgmiEarnings,
  total_tournaments: data.organization.totalTournaments,
  total_matches: data.organization.totalMatches,
  peak_viewership: data.organization.peakViewership,
  peak_viewership_event: data.organization.peakViewershipEvent,
  peak_viewership_year: data.organization.peakViewershipYear,
};

await upsert("organizations", [organization]);

await upsert(
  "viewership_milestones",
  data.organization.viewershipMilestones.map((item) => ({
    id: keyId("milestone", item.event, String(item.year)),
    organization_id: "team-soul",
    event: item.event,
    viewers: item.viewers,
    year: item.year,
  }))
);

await upsert(
  "eras",
  data.eras.map((era) => ({
    id: era.id,
    name: era.name,
    year_start: era.yearRange[0],
    year_end: era.yearRange[1],
    description: era.description,
    defining_moment: era.definingMoment,
    outcome: era.outcome,
  }))
);

await upsert(
  "era_key_players",
  data.eras.flatMap((era) =>
    era.keyPlayers.map((playerId) => ({
      id: keyId("era_key", era.id, playerId),
      era_id: era.id,
      player_id: playerId,
    }))
  )
);

const players = Object.values(data.players);
await upsert(
  "players",
  players.map((player) => ({
    id: player.id,
    display_name: player.displayName,
    real_name: player.realName,
    role: player.role,
    impact: player.impact,
    is_founder: player.isFounder,
    is_active: player.isActive,
    current_status: player.currentStatus,
  }))
);

await upsert(
  "player_stints",
  players.flatMap((player) =>
    player.stints.map((stint, idx) => ({
      id: keyId("stint", player.id, String(idx + 1)),
      player_id: player.id,
      join_date: stint.joinDate,
      leave_date: stint.leaveDate,
      join_context: stint.joinContext,
      leave_reason: stint.leaveReason ?? null,
      era_id: stint.era,
    }))
  )
);

const tournaments = data.tournaments.map((tournament) => ({
  id: tournament.id,
  name: tournament.name,
  year: tournament.year,
  month: tournament.month ?? null,
  tier: tournament.tier,
  placement: tournament.placement === null ? null : String(tournament.placement),
  approx_price: tournament.prize ?? null,
  is_win: tournament.isWin,
  status: "completed",
}));

const upcoming = [
  {
    id: "upcoming-bgms-2026-season-4",
    name: "BGMS 2026 Season 4",
    year: 2026,
    month: 7,
    tier: "S-Tier",
    placement: null,
    approx_price: 150000,
    is_win: false,
    status: "upcoming",
    event_date: "2026-07-18",
    location: "Delhi, India",
    details: "Invitational LAN with 24 top BGMI teams.",
  },
  {
    id: "upcoming-snapdragon-pro-series-2026",
    name: "Snapdragon Pro Series 2026",
    year: 2026,
    month: 9,
    tier: "S-Tier",
    placement: null,
    approx_price: 220000,
    is_win: false,
    status: "upcoming",
    event_date: "2026-09-06",
    location: "Mumbai, India",
    details: "Cross-region championship featuring partner league winners.",
  },
  {
    id: "upcoming-bgis-2027-the-grind",
    name: "BGIS 2027: The Grind",
    year: 2027,
    month: 1,
    tier: "Qualifier",
    placement: null,
    approx_price: 50000,
    is_win: false,
    status: "upcoming",
    event_date: "2027-01-12",
    location: "Online",
    details: "Open qualifier path for BGIS 2027.",
  },
];

const tournamentIds = new Set([...tournaments, ...upcoming].map((item) => item.id));

await upsert("tournaments", [...tournaments, ...upcoming]);

await upsert(
  "tournament_rosters",
  data.tournaments.flatMap((tournament) =>
    (tournament.roster ?? []).map((playerId) => ({
      id: keyId("tour_roster", tournament.id, playerId),
      tournament_id: tournament.id,
      player_id: playerId,
    }))
  )
);

await upsert(
  "awards",
  players.flatMap((player) =>
    player.awards.map((award, idx) => ({
      id: keyId("player_award", player.id, String(idx + 1), award.name),
      name: award.name,
      recipient: award.recipient,
      approx_price: award.prize ?? null,
      tournament_id: tournamentIds.has(award.tournament) ? award.tournament : null,
      player_id: player.id,
    }))
  )
);

await upsert(
  "roster_snapshots",
  data.rosterSnapshots.map((snapshot, idx) => ({
    id: keyId("snapshot", String(snapshot.year), String(idx + 1)),
    year: snapshot.year,
    event: snapshot.event,
    note: snapshot.note,
  }))
);

const snapshots = data.rosterSnapshots.map((snapshot, idx) => ({
  id: keyId("snapshot", String(snapshot.year), String(idx + 1)),
  ...snapshot,
}));

await upsert(
  "roster_snapshot_players",
  snapshots.flatMap((snapshot) =>
    snapshot.players.map((playerId) => ({
      id: keyId("snapshot_player", snapshot.id, playerId),
      snapshot_id: snapshot.id,
      player_id: playerId,
    }))
  )
);

await upsert(
  "roster_changes",
  data.rosterChanges.map((change, idx) => ({
    id: keyId("change", change.playerId, change.date, String(idx + 1)),
    player_id: change.playerId,
    action: change.action,
    date: change.date,
    context: change.context ?? null,
  }))
);

await upsert("aggregate_stats", [
  {
    id: "team-soul-stats",
    total_wins: data.stats.totalWins,
    total_approx_price: data.stats.totalPrize,
    wins_by_tier: data.stats.winsByTier,
    tournaments_by_year: data.stats.tournamentsByYear,
    best_placement_tournament: data.stats.bestPlacement.tournament,
    best_placement: String(data.stats.bestPlacement.placement),
    best_placement_approx_price: data.stats.bestPlacement.prize,
  },
]);

console.log("Supabase migration complete.");
