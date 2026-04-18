// ============================================================================
// Team SouL Archive — Type Definitions
// Source of truth for all data structures in the application.
// ============================================================================

export interface SoulArchive {
  organization: Organization;
  eras: Era[];
  players: Record<string, Player>;
  staff: Record<string, StaffMember>;
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
  staff?: string[];
  storyImageUrl?: string;
  storyImageAlt?: string;
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

export interface StaffMember {
  id: string;
  displayName: string;
  realName: string;
  role: string;
  joinDate: string;
  leaveDate?: string | null;
  isActive: boolean;
  impact: string;
  eras: string[];
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
  status?: "completed" | "upcoming" | "live";
  eventDate?: string;
  location?: string;
  details?: string;
  coach?: string | null;
  analyst?: string | null;
  roster?: string[];
  staff?: string[];
  awards?: Award[];
}

export type DataFeedSource = "db" | "unavailable";

export interface PublicTournamentFeedResult {
  tournaments: Tournament[];
  source: DataFeedSource;
  message?: string;
}

export interface PublicArchiveFeedResult {
  organization: Organization;
  stats: AggregateStats;
  eras: Era[];
  players: Player[];
  staff: StaffMember[];
  source: DataFeedSource;
  message?: string;
}

export interface BlobAsset {
  relativePath: string;
  url: string;
  createdAt?: string | null;
}

export interface PublicBlobAssetFeedResult {
  assets: BlobAsset[];
  generatedAt?: string | null;
  totalFiles: number;
  source: DataFeedSource;
  message?: string;
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

export interface CreateUpcomingTournamentInput {
  name: string;
  tier: Tournament["tier"];
  year: number;
  status?: "upcoming" | "live";
  month?: number | null;
  eventDate?: string | null;
  location?: string | null;
  approxPrize?: number | null;
  details?: string | null;
  coach?: string | null;
  analyst?: string | null;
  rosterIds?: string[];
}

export interface UpdateTournamentInput {
  name: string;
  tier: Tournament["tier"];
  year: number;
  status?: "upcoming" | "live" | "completed";
  month?: number | null;
  eventDate?: string | null;
  location?: string | null;
  approxPrize?: number | null;
  details?: string | null;
  coach?: string | null;
  analyst?: string | null;
  placement?: string | null;
  isWin?: boolean;
  rosterIds?: string[];
}

export interface CompleteTournamentInput extends UpdateTournamentInput {
  placement: string;
  rosterIds: string[];
}

export interface AdminTournament {
  id: string;
  name: string;
  year: number;
  month: number | null;
  tier: Tournament["tier"];
  placement: string | null;
  approxPrize: number | null;
  isWin: boolean;
  status: NonNullable<Tournament["status"]>;
  eventDate: string | null;
  location: string | null;
  details: string | null;
  coach: string | null;
  analyst: string | null;
  rosterIds: string[];
}

export interface AdminPlayerOption {
  id: string;
  displayName: string;
  role: string;
  currentStatus: Player["currentStatus"];
  isActive: boolean;
}

export interface CreateAdminPlayerInput {
  id?: string;
  displayName: string;
  role?: string | null;
  currentStatus?: Player["currentStatus"];
  isActive?: boolean;
}

export interface UpdateAdminPlayerInput {
  displayName: string;
  role?: string | null;
  currentStatus?: Player["currentStatus"];
  isActive?: boolean;
}

export type CommunityVotingState = "draft" | "open" | "locked";

export interface CommunityUser {
  id: string;
  username: string;
  createdAt: string;
}

export interface CommunitySession {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface CommunityBoardPlayer {
  id: string;
  teamId: string;
  displayName: string;
  role: string | null;
  isMvpCandidate: boolean;
  isIglCandidate: boolean;
  sortOrder: number;
}

export interface CommunityBoardTeam {
  id: string;
  boardId: string;
  name: string;
  shortName: string | null;
  sortOrder: number;
  players: CommunityBoardPlayer[];
}

export interface CommunityBoard {
  id: string;
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: NonNullable<Tournament["status"]>;
  headline: string | null;
  description: string | null;
  isFeatured: boolean;
  votingState: CommunityVotingState;
  createdAt: string;
  updatedAt: string;
  teams: CommunityBoardTeam[];
}

export interface CommunityVote {
  id: string;
  boardId: string;
  userId: string;
  mvpPlayerId: string;
  bestIglPlayerId: string;
  winnerTeamId: string;
  createdAt: string;
}

export interface CommunityVoteAggregate {
  totalVotes: number;
  mvpVotesByPlayerId: Record<string, number>;
  iglVotesByPlayerId: Record<string, number>;
  winnerVotesByTeamId: Record<string, number>;
}

export interface CommunityAuthPayload {
  username: string;
  password: string;
}

export interface CommunityVotePayload {
  boardId: string;
  mvpPlayerId: string;
  bestIglPlayerId: string;
  winnerTeamId: string;
}

export interface CommunityBoardTeamEditorInput {
  id?: string;
  name: string;
  shortName?: string | null;
  sortOrder: number;
  players: Array<{
    id?: string;
    displayName: string;
    role?: string | null;
    isMvpCandidate?: boolean;
    isIglCandidate?: boolean;
    sortOrder: number;
  }>;
}

export interface CreateCommunityBoardInput {
  tournamentId: string;
  headline?: string | null;
  description?: string | null;
  votingState?: CommunityVotingState;
  isFeatured?: boolean;
}

export interface UpdateCommunityBoardInput {
  headline?: string | null;
  description?: string | null;
  votingState?: CommunityVotingState;
  isFeatured?: boolean;
  teams?: CommunityBoardTeamEditorInput[];
}

export interface AdminCommunityBoard extends CommunityBoard {
  voteAggregate: CommunityVoteAggregate;
}

// Tier color mapping — muted professional palette
export const TIER_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  "S-Tier": { bg: "bg-cyan-400/10", text: "text-cyan-300", glow: "" },
  "A-Tier": { bg: "bg-cyan-400/8", text: "text-cyan-300", glow: "" },
  "B-Tier": { bg: "bg-lime-400/10", text: "text-lime-300", glow: "" },
  "C-Tier": { bg: "bg-zinc-500/10", text: "text-zinc-400", glow: "" },
  "Qualifier": { bg: "bg-zinc-500/10", text: "text-zinc-400", glow: "" },
  "Showmatch": { bg: "bg-zinc-500/10", text: "text-zinc-300", glow: "" },
};
