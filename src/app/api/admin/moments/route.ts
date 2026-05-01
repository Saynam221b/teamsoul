import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import {
  createAdminMediaMoment,
  listAdminMediaMoments,
  updateAdminMediaMoment,
} from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";
import type { CreateMediaMomentInput, UpdateMediaMomentInput } from "@/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const moments = await listAdminMediaMoments();
    return NextResponse.json({ moments });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not load moments.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as CreateMediaMomentInput;
    const moment = await createAdminMediaMoment(payload);
    return NextResponse.json({ moment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not publish moment.") },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as UpdateMediaMomentInput & { id?: string };
    if (!payload.id) {
      return NextResponse.json({ error: "Moment id is required." }, { status: 400 });
    }

    const moment = await updateAdminMediaMoment(payload.id, payload);
    return NextResponse.json({ moment });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not update moment.") },
      { status: 400 }
    );
  }
}
