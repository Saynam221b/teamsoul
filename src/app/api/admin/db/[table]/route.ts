import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TABLES = new Set([
  "organizations",
  "viewership_milestones",
  "eras",
  "era_key_players",
  "players",
  "player_stints",
  "tournaments",
  "tournament_rosters",
  "awards",
  "roster_snapshots",
  "roster_snapshot_players",
  "roster_changes",
  "aggregate_stats",
]);

function isAuthorized(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return request.headers.get("x-admin-password") === adminPassword;
}

function isAllowedTable(table: string) {
  return ALLOWED_TABLES.has(table);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ table: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table } = await context.params;
  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: "Table not allowed" }, { status: 400 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await client.from(table).select("*").limit(300);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ table: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table } = await context.params;
  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: "Table not allowed" }, { status: 400 });
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const payload = (await request.json()) as {
    action: "create" | "update" | "delete";
    row?: Record<string, unknown>;
    id?: string;
  };

  if (payload.action === "delete") {
    if (!payload.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await client.from(table).delete().eq("id", payload.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!payload.row || typeof payload.row !== "object") {
    return NextResponse.json({ error: "Missing row payload" }, { status: 400 });
  }

  if (payload.action === "create") {
    const { data, error } = await client.from(table).insert(payload.row).select("*").single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ row: data });
  }

  if (payload.action === "update") {
    const id = String(payload.row.id ?? payload.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "Missing id for update" }, { status: 400 });
    }
    const { data, error } = await client
      .from(table)
      .update(payload.row)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ row: data });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
