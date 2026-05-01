import { NextResponse } from "next/server";
import { requireCommunityUser } from "@/lib/communityAuth";
import { getFanProfileSummary } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireCommunityUser();
    const profile = await getFanProfileSummary(user);
    return NextResponse.json({ profile });
  } catch (error) {
    const message = messageFromError(error, "Could not load fan profile.");
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
