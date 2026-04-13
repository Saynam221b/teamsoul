// ============================================================================
// Team SouL Archive — Type Definitions
// Source of truth for all data structures in the application.
// ============================================================================

export interface SoulArchive {
  organization: Organization;
  eras: Era[];
  players: Record<string, Player>;
  tournaments: Tournament[];
  rosterSnapshots: RosterSnapshot[];
  rosterChanges: RosterChange[];
  stats: AggregateStats;
}

export interface Organization {
  name: string;
  founded: string;
  parentOrg: string;
  parentOrgFormed: string;
  totalEarnings: number;
  bgmiEarnings: number;
  totalTournaments: number;
  totalMatches: number;
  peakViewership: number;
  peakViewershipEvent: string;
  peakViewershipYear: number;
  viewershipMilestones: ViewershipMilestone[];
}

export interface ViewershipMilestone {
  event: string;
  viewers: number;
  year: number;
}

export interface Era {
  id: string;
  name: string;
  yearRange: [number, number];
  description: string;
  keyPlayers: string[];
  definingMoment: string;
  outcome: "triumph" | "decline" | "rebuild" | "dominance";
}

export interface Player {
  id: string;
  displayName: string;
  realName: string;
  role: string;
  stints: PlayerStint[];
  awards: Award[];
  impact: string;
  isFounder: boolean;
  isActive: boolean;
  currentStatus: "active" | "retired" | "departed";
}

export interface PlayerStint {
  joinDate: string;
  leaveDate: string | null;
  joinContext: string;
  leaveReason?: string;
  era: string;
}

export interface Tournament {
  id: string;
  name: string;
  year: number;
  month?: number;
  tier: "S-Tier" | "A-Tier" | "B-Tier" | "C-Tier" | "Qualifier" | "Showmatch";
  placement: number | string;
  prize: number | null;
  isWin: boolean;
  roster?: string[];
  awards?: Award[];
}

export interface Award {
  name: string;
  recipient: string;
  prize?: number;
  tournament: string;
}

export interface RosterSnapshot {
  year: number;
  players: string[];
  event: string;
  note: string;
}

export interface RosterChange {
  playerId: string;
  action: "JOINED" | "LEFT" | "RETIRED" | "ROLE_CHANGE";
  date: string;
  context?: string;
}

export interface AggregateStats {
  totalWins: number;
  totalPrize: number;
  winsByTier: Record<string, number>;
  tournamentsByYear: Record<number, number>;
  bestPlacement: { tournament: string; placement: number; prize: number };
}

// Tier color mapping — muted professional palette
export const TIER_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  "S-Tier": { bg: "bg-amber-500/8", text: "text-amber-400", glow: "" },
  "A-Tier": { bg: "bg-sky-500/8", text: "text-sky-400", glow: "" },
  "B-Tier": { bg: "bg-emerald-500/8", text: "text-emerald-400", glow: "" },
  "C-Tier": { bg: "bg-zinc-500/8", text: "text-zinc-400", glow: "" },
  "Qualifier": { bg: "bg-violet-500/8", text: "text-violet-400", glow: "" },
  "Showmatch": { bg: "bg-rose-500/8", text: "text-rose-400", glow: "" },
};
