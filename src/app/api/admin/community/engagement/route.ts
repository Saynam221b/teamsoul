import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import { getFanEngagementSnapshot } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const engagement = await getFanEngagementSnapshot();
    return NextResponse.json({ engagement });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not load engagement snapshot.") },
      { status: 500 }
    );
  }
}
