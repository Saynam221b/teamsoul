import { describe, expect, it } from "vitest";
import {
  buildReactionSummary,
  canClaimBadge,
  isCommunityReactionKey,
  isPublicFanContentStatus,
  normalizeFanContentStatus,
  normalizeMomentTemplate,
} from "../src/lib/fanArena";

describe("fan arena helpers", () => {
  it("normalizes explicit publish states", () => {
    expect(normalizeFanContentStatus("published")).toBe("published");
    expect(normalizeFanContentStatus("pinned")).toBe("pinned");
    expect(normalizeFanContentStatus("bad")).toBe("draft");
  });

  it("exposes only published or pinned content", () => {
    expect(isPublicFanContentStatus("published")).toBe(true);
    expect(isPublicFanContentStatus("pinned")).toBe(true);
    expect(isPublicFanContentStatus("draft")).toBe(false);
  });

  it("validates reaction and moment keys", () => {
    expect(isCommunityReactionKey("clutch")).toBe(true);
    expect(isCommunityReactionKey("spam")).toBe(false);
    expect(normalizeMomentTemplate("match_countdown")).toBe("match_countdown");
    expect(normalizeMomentTemplate("bad")).toBe("trophy_pulse");
  });

  it("builds reaction summaries with zero-filled keys", () => {
    expect(
      buildReactionSummary("event_1", [
        { reactionKey: "soul", total: 2 },
        { reactionKey: "hype", total: 3 },
      ])
    ).toEqual({
      liveEventId: "event_1",
      total: 5,
      counts: {
        soul: 2,
        hype: 3,
        clutch: 0,
        respect: 0,
      },
    });
  });

  it("gates badge awards by fan activity", () => {
    expect(canClaimBadge("first_vote_locked", { votesCount: 1, reactionsCount: 0 })).toBe(true);
    expect(canClaimBadge("first_vote_locked", { votesCount: 0, reactionsCount: 0 })).toBe(false);
    expect(canClaimBadge("arena_pulse", { votesCount: 0, reactionsCount: 2 })).toBe(false);
    expect(canClaimBadge("arena_pulse", { votesCount: 0, reactionsCount: 3 })).toBe(true);
  });
});
