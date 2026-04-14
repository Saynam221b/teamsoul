import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import {
  createUpcomingTournament,
  listAdminTournaments,
} from "@/lib/db/adminTournaments";
import type { CreateUpcomingTournamentInput } from "@/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const tournaments = await listAdminTournaments();
    return NextResponse.json({ tournaments });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load tournaments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as CreateUpcomingTournamentInput;
    const tournament = await createUpcomingTournament(payload);
    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create tournament" },
      { status: 400 }
    );
  }
}
