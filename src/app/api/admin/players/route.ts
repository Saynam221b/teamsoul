import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import { createAdminPlayer, listAdminPlayers } from "@/lib/db/adminTournaments";
import type { CreateAdminPlayerInput } from "@/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const players = await listAdminPlayers();
    return NextResponse.json({ players });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load players" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as CreateAdminPlayerInput;
    const player = await createAdminPlayer(payload);
    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create player" },
      { status: 400 }
    );
  }
}
