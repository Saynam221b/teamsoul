import { NextResponse } from "next/server";
import type { CommunityPostReactionPayload } from "@/data/types";
import { requireCommunityUser } from "@/lib/communityAuth";
import { toggleCommunityPostReaction } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await requireCommunityUser();
    const payload = (await request.json()) as CommunityPostReactionPayload;
    const { postId } = await params;

    if (!payload?.reactionType) {
      return NextResponse.json({ error: "Reaction type is required." }, { status: 400 });
    }

    const post = await toggleCommunityPostReaction(user.id, postId, payload.reactionType);
    return NextResponse.json({ post });
  } catch (error) {
    const message = messageFromError(error, "Reaction could not be updated.");
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
