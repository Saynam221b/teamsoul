import { NextResponse } from "next/server";
import type { CommunityAuthPayload } from "@/data/types";
import {
  getCommunitySessionCookieConfig,
  loginCommunityUser,
  signUpCommunityUser,
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

    await signUpCommunityUser(payload);
    const session = await loginCommunityUser(payload);

    const response = NextResponse.json({ user: session.user }, { status: 201 });
    const cookie = getCommunitySessionCookieConfig(session.expiresAt);
    response.cookies.set({
      name: cookie.name,
      value: session.sessionToken,
      ...cookie.options,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not create account.") },
      { status: 400 }
    );
  }
}
