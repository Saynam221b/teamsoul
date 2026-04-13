import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY_TABLES = ["tournaments", "players", "eras"] as const;
const EXTRA_TABLES = [
  "organizations",
  "viewership_milestones",
  "era_key_players",
  "player_stints",
  "tournament_rosters",
  "awards",
  "roster_snapshots",
  "roster_snapshot_players",
  "roster_changes",
  "aggregate_stats",
] as const;

function isAuthorized(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return request.headers.get("x-admin-password") === adminPassword;
}

async function getTableCount(
  table: string
): Promise<{ count: number | null; error: string | null }> {
  const client = getSupabaseAdmin();
  if (!client) {
    return { count: null, error: "Supabase not configured" };
  }

  const { count, error } = await client
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    return { count: null, error: error.message };
  }

  return { count: count ?? 0, error: null };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        schemaReady: false,
        seeded: false,
        fallbackActive: true,
        tableCounts: {},
        setupChecklist: {
          schemaApplied: false,
          seedRun: false,
          keyTablesReady: false,
        },
        error: "Supabase not configured",
      },
      { status: 200 }
    );
  }

  const tables = [...KEY_TABLES, ...EXTRA_TABLES];
  const tableCounts: Record<string, number> = {};
  const tableErrors: Record<string, string> = {};

  for (const table of tables) {
    const result = await getTableCount(table);
    if (result.error) {
      tableErrors[table] = result.error;
      continue;
    }
    tableCounts[table] = result.count ?? 0;
  }

  const schemaReady = KEY_TABLES.every((table) => table in tableCounts);
  const seeded =
    schemaReady && KEY_TABLES.every((table) => (tableCounts[table] ?? 0) > 0);
  const fallbackActive = !schemaReady;

  return NextResponse.json({
    schemaReady,
    seeded,
    fallbackActive,
    tableCounts,
    tableErrors,
    setupChecklist: {
      schemaApplied: schemaReady,
      seedRun: seeded,
      keyTablesReady: KEY_TABLES.every((table) => (tableCounts[table] ?? 0) > 0),
    },
  });
}
