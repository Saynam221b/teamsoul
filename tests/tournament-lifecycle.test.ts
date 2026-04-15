import { describe, expect, it } from "vitest";
import type { Tournament } from "../src/data/types";
import {
  getChampionshipTournaments,
  getCompletedTournaments,
  normalizeTournamentLifecycleInput,
} from "../src/lib/tournamentLifecycle";

describe("normalizeTournamentLifecycleInput", () => {
  it("drops completed-only fields for upcoming updates", () => {
    const normalized = normalizeTournamentLifecycleInput({
      status: "upcoming",
      placement: "1",
      isWin: true,
      rosterIds: ["manya", "nakul"],
    });

    expect(normalized).toEqual({
      status: "upcoming",
      placement: null,
      isWin: false,
      rosterIds: [],
    });
  });

  it("drops completed-only fields for live updates", () => {
    const normalized = normalizeTournamentLifecycleInput({
      status: "live",
      placement: "2",
      isWin: true,
      rosterIds: ["manya"],
    });

    expect(normalized).toEqual({
      status: "live",
      placement: null,
      isWin: false,
      rosterIds: [],
    });
  });

  it("keeps completed fields for completed updates", () => {
    const normalized = normalizeTournamentLifecycleInput({
      status: "completed",
      placement: "1",
      isWin: true,
      rosterIds: ["manya", "nakul"],
    });

    expect(normalized).toEqual({
      status: "completed",
      placement: "1",
      isWin: true,
      rosterIds: ["manya", "nakul"],
    });
  });
});

describe("public tournament classification", () => {
  const tournaments: Tournament[] = [
    {
      id: "completed-win",
      name: "Completed Win",
      year: 2026,
      tier: "A-Tier",
      placement: 1,
      prize: 1000,
      isWin: true,
      status: "completed",
    },
    {
      id: "upcoming-win-flag",
      name: "Upcoming with bad win flag",
      year: 2026,
      tier: "A-Tier",
      placement: "TBD",
      prize: null,
      isWin: true,
      status: "upcoming",
    },
    {
      id: "live-win-flag",
      name: "Live with bad win flag",
      year: 2026,
      tier: "S-Tier",
      placement: "TBD",
      prize: null,
      isWin: true,
      status: "live",
    },
    {
      id: "completed-non-win",
      name: "Completed non win",
      year: 2025,
      tier: "B-Tier",
      placement: 5,
      prize: null,
      isWin: false,
      status: "completed",
    },
  ];

  it("keeps completed results separate from upcoming/live", () => {
    const completed = getCompletedTournaments(tournaments);
    expect(completed.map((item) => item.id)).toEqual([
      "completed-win",
      "completed-non-win",
    ]);
  });

  it("includes only completed wins in championships", () => {
    const championships = getChampionshipTournaments(tournaments);
    expect(championships.map((item) => item.id)).toEqual(["completed-win"]);
  });
});
