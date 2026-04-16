import { NextResponse } from "next/server";
import type { CommunityAuthPayload } from "@/data/types";
import {
  getCommunitySessionCookieConfig,
  loginCommunityUser,
} from "@/lib/communityAuth";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CommunityAuthPayload;
    if (!payload?.username || !payload?.password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const session = await loginCommunityUser(payload);
    const response = NextResponse.json({ user: session.user });
    const cookie = getCommunitySessionCookieConfig(session.expiresAt);
    response.cookies.set({
      name: cookie.name,
      value: session.sessionToken,
      ...cookie.options,
    });
    return response;
  } catch (error) {
    const message = messageFromError(error, "Could not log in.");
    const status = message === "Invalid JSON payload." ? 400 : 401;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
