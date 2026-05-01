import type { CommunityPostReactionType } from "@/data/types";

export const COMMUNITY_POST_MAX_LENGTH = 280;

export function normalizeCommunityPostBody(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateCommunityPostBody(body: string): string | null {
  const normalized = normalizeCommunityPostBody(body);

  if (!normalized) {
    return "Post text is required.";
  }

  if (normalized.length > COMMUNITY_POST_MAX_LENGTH) {
    return `Post must be ${COMMUNITY_POST_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

export function isCommunityPostReactionType(value: unknown): value is CommunityPostReactionType {
  return value === "like" || value === "dislike";
}

export function getNextCommunityReaction(
  current: CommunityPostReactionType | null,
  incoming: CommunityPostReactionType
): CommunityPostReactionType | null {
  return current === incoming ? null : incoming;
}
