import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import {
  deleteAdminCommunityBoard,
  updateAdminCommunityBoard,
} from "@/lib/db/community";
import type { UpdateCommunityBoardInput } from "@/data/types";
import { messageFromError } from "@/lib/httpErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateCommunityBoardInput;
    const board = await updateAdminCommunityBoard(id, payload);
    return NextResponse.json({ board });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not update community board.") },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { id } = await context.params;
    await deleteAdminCommunityBoard(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromError(error, "Could not delete community board.") },
      { status: 400 }
    );
  }
}
