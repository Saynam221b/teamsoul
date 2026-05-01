import { NextResponse } from "next/server";
import type { CommunityBadgeClaimPayload } from "@/data/types";
import { requireCommunityUser } from "@/lib/communityAuth";
import { claimCommunityBadge } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser();
    const payload = (await request.json()) as CommunityBadgeClaimPayload;
    const badge = await claimCommunityBadge(user.id, payload);

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    const message = messageFromError(error, "Badge could not be claimed.");
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
