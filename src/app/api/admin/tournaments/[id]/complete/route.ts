import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import { completeTournament } from "@/lib/db/adminTournaments";
import type { CompleteTournamentInput } from "@/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as CompleteTournamentInput;
    const tournament = await completeTournament(id, payload);
    return NextResponse.json({ tournament });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not complete tournament" },
      { status: 400 }
    );
  }
}
