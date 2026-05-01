import { NextResponse } from "next/server";
import type { CommunityReactionPayload } from "@/data/types";
import { requireCommunityUser } from "@/lib/communityAuth";
import { submitCommunityReaction } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser();
    const payload = (await request.json()) as CommunityReactionPayload;

    if (!payload?.liveEventId || !payload?.reactionKey) {
      return NextResponse.json({ error: "Live event and reaction are required." }, { status: 400 });
    }

    const result = await submitCommunityReaction(user.id, payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = messageFromError(error, "Reaction could not be submitted.");
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
