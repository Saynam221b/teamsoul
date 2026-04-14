import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  return NextResponse.json(
    {
      error: "Blob uploads are no longer handled through the admin UI. Use the CLI upload scripts instead.",
    },
    { status: 410 }
  );
}
