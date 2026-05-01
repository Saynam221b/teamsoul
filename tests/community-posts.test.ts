import { describe, expect, it } from "vitest";
import {
  COMMUNITY_POST_MAX_LENGTH,
  getNextCommunityReaction,
  isCommunityPostReactionType,
  normalizeCommunityPostBody,
  validateCommunityPostBody,
} from "../src/lib/communityPosts";

describe("community post validation", () => {
  it("normalizes whitespace and preserves intentional paragraphs", () => {
    expect(normalizeCommunityPostBody("  Team SouL  \n\n\n  forever  ")).toBe("Team SouL\n\nforever");
  });

  it("rejects empty posts and oversized posts", () => {
    expect(validateCommunityPostBody("   ")).toBe("Post text is required.");
    expect(validateCommunityPostBody("x".repeat(COMMUNITY_POST_MAX_LENGTH + 1))).toContain("characters or fewer");
  });

  it("accepts a valid post body", () => {
    expect(validateCommunityPostBody("BGIS 2026 champions.")).toBeNull();
  });
});

describe("community reactions", () => {
  it("validates supported reaction types", () => {
    expect(isCommunityPostReactionType("like")).toBe(true);
    expect(isCommunityPostReactionType("dislike")).toBe(true);
    expect(isCommunityPostReactionType("fire")).toBe(false);
  });

  it("toggles off repeated reactions and switches between types", () => {
    expect(getNextCommunityReaction(null, "like")).toBe("like");
    expect(getNextCommunityReaction("like", "like")).toBeNull();
    expect(getNextCommunityReaction("like", "dislike")).toBe("dislike");
  });
});
