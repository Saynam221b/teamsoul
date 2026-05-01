import { describe, expect, it } from "vitest";
import type { Tournament } from "../src/data/types";
import {
  getCanonicalTournaments,
  getEntityVerificationSummary,
  getRecentApprovedChanges,
  mergeTournamentTruth,
} from "../src/lib/sourceTruth";

describe("mergeTournamentTruth", () => {
  const tournaments: Tournament[] = [
    {
      id: "bgis-2026",
      name: "Battlegrounds Mobile India Series 2026",
      year: 2026,
      tier: "A-Tier",
      placement: 1,
      prize: 105505,
      isWin: true,
      status: "completed",
    },
    {
      id: "bmps-2026",
      name: "Battlegrounds Mobile India Pro Series 2026",
      year: 2026,
      tier: "A-Tier",
      placement: "TBD",
      prize: null,
      isWin: false,
      status: "upcoming",
    },
    {
      id: "summer-championship-series",
      name: "Summer Championship Series",
      year: 2026,
      tier: "C-Tier",
      placement: "TBD",
      prize: null,
      isWin: false,
      status: "live",
    },
  ];

  it("keeps completed verified events confirmed and downgrades speculative live or upcoming entries", () => {
    const merged = mergeTournamentTruth(tournaments);

    expect(merged.map((item) => [item.id, item.canonicalStatus])).toEqual([
      ["bgis-2026", "confirmed"],
      ["bmps-2026", "candidate"],
      ["summer-championship-series", "candidate"],
    ]);
  });

  it("exposes only confirmed tournaments on canonical public surfaces", () => {
    const merged = mergeTournamentTruth(tournaments);
    expect(getCanonicalTournaments(merged).map((item) => item.id)).toEqual([
      "bgis-2026",
    ]);
  });
});

describe("source-truth metadata", () => {
  it("returns verification counts and the newest verification date", () => {
    const summary = getEntityVerificationSummary("tournament", "bgis-2026");

    expect(summary.sourceCount).toBeGreaterThanOrEqual(2);
    expect(summary.lastVerifiedAt).toBe("2026-04-29");
  });

  it("orders approved changes newest-first for the public updates feed", () => {
    const changes = getRecentApprovedChanges();

    expect(changes[0]?.id).toBe("canonical-reset-apr-2026");
    expect(changes.some((item) => item.entityType === "tournament")).toBe(true);
    expect(changes.some((item) => item.entityType === "player")).toBe(true);
  });
});
