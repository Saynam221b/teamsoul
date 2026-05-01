import { NextResponse } from "next/server";
import { listPublicMediaMoments } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 6);
    const moments = await listPublicMediaMoments(Number.isFinite(limit) ? limit : 6);

    return NextResponse.json({ moments });
  } catch (error) {
    return NextResponse.json({ error: messageFromError(error, "Could not load moments.") }, { status: 500 });
  }
}
