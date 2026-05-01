import type {
  CommunityReactionKey,
  CommunityReactionSummary,
  FanContentStatus,
  MediaMomentTemplateKey,
} from "@/data/types";

export const FAN_CONTENT_STATUSES: FanContentStatus[] = [
  "draft",
  "published",
  "pinned",
  "expired",
  "archived",
];

export const FAN_REACTION_OPTIONS: Array<{
  key: CommunityReactionKey;
  label: string;
  shortLabel: string;
}> = [
  { key: "soul", label: "Soul", shortLabel: "SOUL" },
  { key: "hype", label: "Hype", shortLabel: "HYPE" },
  { key: "clutch", label: "Clutch", shortLabel: "CLUTCH" },
  { key: "respect", label: "Respect", shortLabel: "RESPECT" },
];

export const MOMENT_TEMPLATE_OPTIONS: Array<{
  key: MediaMomentTemplateKey;
  label: string;
}> = [
  { key: "trophy_pulse", label: "Trophy Pulse" },
  { key: "roster_intro", label: "Roster Intro" },
  { key: "match_countdown", label: "Match Countdown" },
];

export function normalizeFanContentStatus(value: unknown): FanContentStatus {
  return FAN_CONTENT_STATUSES.includes(value as FanContentStatus) ? (value as FanContentStatus) : "draft";
}

export function isPublicFanContentStatus(status: FanContentStatus): boolean {
  return status === "published" || status === "pinned";
}

export function isCommunityReactionKey(value: unknown): value is CommunityReactionKey {
  return FAN_REACTION_OPTIONS.some((option) => option.key === value);
}

export function normalizeMomentTemplate(value: unknown): MediaMomentTemplateKey {
  return MOMENT_TEMPLATE_OPTIONS.some((option) => option.key === value)
    ? (value as MediaMomentTemplateKey)
    : "trophy_pulse";
}

export function createEmptyReactionCounts(): Record<CommunityReactionKey, number> {
  return {
    soul: 0,
    hype: 0,
    clutch: 0,
    respect: 0,
  };
}

export function buildReactionSummary(
  liveEventId: string,
  rows: Array<{ reactionKey: CommunityReactionKey; total: number }>
): CommunityReactionSummary {
  const counts = createEmptyReactionCounts();
  for (const row of rows) {
    counts[row.reactionKey] = row.total;
  }

  return {
    liveEventId,
    counts,
    total: Object.values(counts).reduce((sum, count) => sum + count, 0),
  };
}

export function canClaimBadge(badgeKey: string, stats: { votesCount: number; reactionsCount: number }): boolean {
  if (badgeKey === "first_vote_locked") {
    return stats.votesCount > 0;
  }

  if (badgeKey === "arena_pulse") {
    return stats.reactionsCount >= 3;
  }

  return badgeKey === "fan_arena_founder";
}

export function badgeCopyForKey(badgeKey: string): { label: string; description: string } {
  if (badgeKey === "first_vote_locked") {
    return {
      label: "Vote Locked",
      description: "Submitted a verified Fan Arena prediction.",
    };
  }

  if (badgeKey === "arena_pulse") {
    return {
      label: "Arena Pulse",
      description: "Reacted to multiple live Team SOUL moments.",
    };
  }

  return {
    label: "Arena Founder",
    description: "Joined the first Fan Arena OS release.",
  };
}
