import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import {
  createAdminCommunityLiveEvent,
  getFanEngagementSnapshot,
  listAdminCommunityLiveEvents,
  updateAdminCommunityLiveEvent,
} from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";
import type {
  CreateCommunityLiveEventInput,
  UpdateCommunityLiveEventInput,
} from "@/data/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const [liveEvents, engagement] = await Promise.all([
      listAdminCommunityLiveEvents(),
      getFanEngagementSnapshot(),
    ]);
    return NextResponse.json({ liveEvents, engagement });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not load live events.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as CreateCommunityLiveEventInput;
    const liveEvent = await createAdminCommunityLiveEvent(payload);
    return NextResponse.json({ liveEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not publish live event.") },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = (await request.json()) as UpdateCommunityLiveEventInput & { id?: string };
    if (!payload.id) {
      return NextResponse.json({ error: "Live event id is required." }, { status: 400 });
    }

    const liveEvent = await updateAdminCommunityLiveEvent(payload.id, payload);
    return NextResponse.json({ liveEvent });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not update live event.") },
      { status: 400 }
    );
  }
}
