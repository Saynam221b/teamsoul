import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import { updateTournament, deleteTournament } from "@/lib/db/adminTournaments";
import type { UpdateTournamentInput } from "@/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateTournamentInput;
    const tournament = await updateTournament(id, payload);
    return NextResponse.json({ tournament });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update tournament" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { id } = await context.params;
    await deleteTournament(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete tournament" },
      { status: 400 }
    );
  }
}
