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

export type SourceType = "official" | "official_tournament" | "wiki" | "report";
export type CanonicalStatus = "confirmed" | "candidate" | "archived";
export type VerifiedEntityType =
  | "organization"
  | "player"
  | "staff"
  | "tournament"
  | "media"
  | "community";

export interface Source {
  id: string;
  name: string;
  sourceType: SourceType;
  baseUrl: string;
  note?: string;
}

export interface SourceReference {
  id: string;
  entityType: VerifiedEntityType;
  entityId: string;
  sourceId: string;
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  verifiedAt: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface VerificationSummary {
  sourceCount: number;
  lastVerifiedAt: string | null;
  canonicalStatus: CanonicalStatus;
  references: SourceReference[];
}

export interface VerificationRecord extends VerificationSummary {
  entityType: VerifiedEntityType;
  entityId: string;
}

export interface ApprovedChange {
  id: string;
  entityType: VerifiedEntityType;
  entityId: string;
  kind: "result" | "roster" | "staff" | "correction" | "media" | "system";
  title: string;
  summary: string;
  publishedAt: string;
  effectiveDate?: string;
  href: string;
  canonicalStatus: CanonicalStatus;
  sourceReferenceIds: string[];
  public: boolean;
}

export interface UpdateCandidate {
  id: string;
  entityType: VerifiedEntityType;
  entityId: string;
  title: string;
  summary: string;
  candidateStatus: "watchlist" | "ready_for_review" | "needs_source";
  proposedAt: string;
  sourceReferenceIds: string[];
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
  canonicalStatus?: CanonicalStatus;
  lastVerifiedAt?: string | null;
  sourceReferences?: SourceReference[];
  recentChangeIds?: string[];
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
  canonicalStatus?: CanonicalStatus;
  lastVerifiedAt?: string | null;
  sourceReferences?: SourceReference[];
  recentChangeIds?: string[];
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
  canonicalStatus?: CanonicalStatus;
  lastVerifiedAt?: string | null;
  sourceReferences?: SourceReference[];
  recentChangeIds?: string[];
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

export interface MediaAsset {
  id: string;
  title: string;
  imageUrl: string;
  assetType: "portrait" | "highlight" | "poster" | "gallery";
  tournamentId?: string;
  playerId?: string;
  staffId?: string;
  eraId?: string;
  createdAt?: string | null;
}

export interface MediaCollection {
  id: string;
  title: string;
  description: string;
  tournamentId?: string;
  assets: MediaAsset[];
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

export interface RosterEvent {
  id: string;
  playerId: string;
  type: "joined" | "left" | "returned" | "role_change" | "award";
  date: string;
  title: string;
  description: string;
  eraId?: string;
  tournamentId?: string;
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

export interface PlayerProfile {
  player: Player;
  verification: VerificationSummary;
  recentChanges: ApprovedChange[];
  rosterEvents: RosterEvent[];
}

export interface StaffProfile {
  staff: StaffMember;
  verification: VerificationSummary;
  recentChanges: ApprovedChange[];
}

export interface TournamentDetail {
  tournament: Tournament;
  verification: VerificationSummary;
  recentChanges: ApprovedChange[];
  rosterPlayers: Player[];
  mediaCollection?: MediaCollection | null;
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

export type CommunityPostReactionType = "like" | "dislike";

export interface CommunityPost {
  id: string;
  authorUserId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  viewerReaction: CommunityPostReactionType | null;
}

export type FanContentStatus = "draft" | "published" | "pinned" | "expired" | "archived";

export type CommunityLiveEventType = "announcement" | "score_update" | "poll" | "moment" | "countdown";

export type CommunityReactionKey = "soul" | "hype" | "clutch" | "respect";

export interface CommunityReactionSummary {
  liveEventId: string;
  total: number;
  counts: Record<CommunityReactionKey, number>;
}

export interface CommunityLiveEvent {
  id: string;
  boardId: string | null;
  tournamentId: string | null;
  tournamentName: string | null;
  eventType: CommunityLiveEventType;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  status: FanContentStatus;
  isPinned: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityReaction {
  id: string;
  liveEventId: string;
  userId: string;
  reactionKey: CommunityReactionKey;
  createdAt: string;
}

export interface CommunityBadge {
  id: string;
  userId: string;
  badgeKey: string;
  label: string;
  description: string;
  source: string | null;
  earnedAt: string;
}

export type MediaMomentTemplateKey = "trophy_pulse" | "roster_intro" | "match_countdown";

export interface MediaMoment {
  id: string;
  tournamentId: string | null;
  tournamentName: string | null;
  title: string;
  description: string | null;
  templateKey: MediaMomentTemplateKey;
  status: FanContentStatus;
  durationSeconds: number;
  accent: "cyan" | "gold" | "energy";
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FanEngagementRollup {
  id: string;
  rollupDate: string;
  boardId: string | null;
  boardHeadline: string | null;
  votesCount: number;
  reactionsCount: number;
  activeUsersCount: number;
  badgesAwardedCount: number;
  createdAt: string;
}

export interface FanProfileSummary {
  user: CommunityUser;
  votesCount: number;
  reactionsCount: number;
  badgesCount: number;
  badges: CommunityBadge[];
}

export interface PredictionSeason {
  id: string;
  title: string;
  status: "upcoming" | "open" | "locked" | "completed";
  tournamentId: string;
}

export interface PredictionEntry {
  id: string;
  seasonId: string;
  userId: string;
  submittedAt: string;
}

export interface UserBadge {
  id: string;
  label: string;
  description: string;
}

export interface UserStreak {
  userId: string;
  current: number;
  best: number;
}

export interface ContributionSubmission {
  id: string;
  kind: "correction" | "media" | "missing_result";
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
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

export interface CommunityPostPayload {
  body: string;
}

export interface CommunityPostReactionPayload {
  reactionType: CommunityPostReactionType;
}

export interface CommunityReactionPayload {
  liveEventId: string;
  reactionKey: CommunityReactionKey;
}

export interface CommunityBadgeClaimPayload {
  badgeKey: string;
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

export interface CreateCommunityLiveEventInput {
  boardId?: string | null;
  tournamentId?: string | null;
  eventType?: CommunityLiveEventType;
  title: string;
  body?: string | null;
  payload?: Record<string, unknown>;
  status?: FanContentStatus;
  isPinned?: boolean;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

export type UpdateCommunityLiveEventInput = Partial<CreateCommunityLiveEventInput>;

export interface CreateMediaMomentInput {
  tournamentId?: string | null;
  title: string;
  description?: string | null;
  templateKey?: MediaMomentTemplateKey;
  status?: FanContentStatus;
  durationSeconds?: number;
  accent?: "cyan" | "gold" | "energy";
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
}

export type UpdateMediaMomentInput = Partial<CreateMediaMomentInput>;

// Tier color mapping — muted professional palette
export const TIER_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  "S-Tier": { bg: "bg-cyan-400/10", text: "text-cyan-300", glow: "" },
  "A-Tier": { bg: "bg-cyan-400/8", text: "text-cyan-300", glow: "" },
  "B-Tier": { bg: "bg-lime-400/10", text: "text-lime-300", glow: "" },
  "C-Tier": { bg: "bg-zinc-500/10", text: "text-zinc-400", glow: "" },
  "Qualifier": { bg: "bg-zinc-500/10", text: "text-zinc-400", glow: "" },
  "Showmatch": { bg: "bg-zinc-500/10", text: "text-zinc-300", glow: "" },
};
