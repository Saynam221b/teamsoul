import { NextResponse } from "next/server";
import {
  getCommunityReactionSummaries,
  listPublicCommunityLiveEvents,
} from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const boardId = url.searchParams.get("boardId");
    const liveEvents = await listPublicCommunityLiveEvents(boardId);
    const reactionSummary = await getCommunityReactionSummaries(liveEvents.map((event) => event.id));

    return NextResponse.json({ liveEvents, reactionSummary });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not load Fan Arena live events.") },
      { status: 500 }
    );
  }
}
