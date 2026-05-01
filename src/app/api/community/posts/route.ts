import { NextResponse } from "next/server";
import type { CommunityPostPayload } from "@/data/types";
import { getCurrentCommunityUser, requireCommunityUser } from "@/lib/communityAuth";
import { createCommunityPost, listCommunityPosts } from "@/lib/db/community";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentCommunityUser();
    const posts = await listCommunityPosts(user?.id ?? null);
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Posts could not be loaded.") },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser();
    const payload = (await request.json()) as CommunityPostPayload;

    if (!payload?.body) {
      return NextResponse.json({ error: "Post text is required." }, { status: 400 });
    }

    const post = await createCommunityPost(user.id, payload.body);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = messageFromError(error, "Post could not be created.");
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
