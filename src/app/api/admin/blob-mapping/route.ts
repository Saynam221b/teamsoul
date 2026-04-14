import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  return NextResponse.json(
    {
      error: "Blob mapping edits are no longer supported in the admin UI. Use the CLI upload scripts instead.",
    },
    { status: 410 }
  );
}

export const POST = GET;
