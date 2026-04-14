import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function deprecated(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  return NextResponse.json(
    {
      error:
        "Generic database row editing has been removed. Use the dedicated tournament admin endpoints instead.",
    },
    { status: 410 }
  );
}

export const GET = deprecated;
export const POST = deprecated;
