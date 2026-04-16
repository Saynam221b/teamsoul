import { NextResponse } from "next/server";
import {
  COMMUNITY_SESSION_COOKIE,
  logoutCommunitySession,
} from "@/lib/communityAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await logoutCommunitySession();

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COMMUNITY_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
