import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/adminAuth";
import {
  getRecentApprovedChanges,
  getTrackedSources,
  getUpdateCandidates,
} from "@/lib/sourceTruth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  const sources = getTrackedSources();
  const approvedChanges = getRecentApprovedChanges(20);
  const updateCandidates = getUpdateCandidates(20);

  return NextResponse.json({
    trackedSources: sources,
    approvedChanges,
    updateCandidates,
    summary: {
      sourceCount: sources.length,
      approvedChangeCount: approvedChanges.length,
      candidateCount: updateCandidates.length,
    },
  });
}
