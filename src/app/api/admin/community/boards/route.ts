import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import {
  createAdminCommunityBoard,
  listAdminCommunityBoards,
  listLiveTournamentOptionsForCommunity,
} from "@/lib/db/community";
import type { CreateCommunityBoardInput } from "@/data/types";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const [boards, liveTournaments] = await Promise.all([
      listAdminCommunityBoards(),
      listLiveTournamentOptionsForCommunity(),
    ]);
    return NextResponse.json({ boards, liveTournaments });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not load community boards.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as CreateCommunityBoardInput;
    if (!payload?.tournamentId) {
      return NextResponse.json({ error: "Tournament is required." }, { status: 400 });
    }

    const board = await createAdminCommunityBoard(payload);
    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not create community board.") },
      { status: 400 }
    );
  }
}
