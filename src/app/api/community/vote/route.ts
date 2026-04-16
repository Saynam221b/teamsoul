import { NextResponse } from "next/server";
import type { CommunityVotePayload } from "@/data/types";
import { requireCommunityUser } from "@/lib/communityAuth";
import { submitCommunityVote } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser();
    const payload = (await request.json()) as CommunityVotePayload;

    if (!payload?.boardId || !payload?.mvpPlayerId || !payload?.bestIglPlayerId || !payload?.winnerTeamId) {
      return NextResponse.json({ error: "All vote selections are required." }, { status: 400 });
    }

    const vote = await submitCommunityVote(user.id, payload);
    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    const message = messageFromError(error, "Vote could not be submitted.");
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
