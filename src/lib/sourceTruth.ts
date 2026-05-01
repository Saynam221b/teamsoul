import type {
  ApprovedChange,
  CanonicalStatus,
  MediaAsset,
  MediaCollection,
  Player,
  PlayerProfile,
  RosterEvent,
  Source,
  SourceReference,
  StaffMember,
  StaffProfile,
  Tournament,
  TournamentDetail,
  UpdateCandidate,
  VerificationSummary,
  VerifiedEntityType,
} from "../data/types";
import {
  APPROVED_CHANGES,
  CANDIDATE_TOURNAMENT_IDS,
  CANDIDATE_TOURNAMENT_NAMES,
  CONFIRMED_UPCOMING_TOURNAMENT_IDS,
  PLAYER_ROLE_OVERRIDES,
  SOURCE_REFERENCES,
  STAFF_ROLE_OVERRIDES,
  TRACKED_SOURCES,
  UPDATE_CANDIDATES,
} from "../data/sourceTruth";

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function getDefaultCanonicalStatus(
  entityType: VerifiedEntityType,
  entityId: string,
  status?: Tournament["status"],
  name?: string
): CanonicalStatus {
  if (entityType === "tournament") {
    if (CONFIRMED_UPCOMING_TOURNAMENT_IDS.has(entityId)) return "confirmed";
    if (CANDIDATE_TOURNAMENT_IDS.has(entityId)) return "candidate";
    if (name && CANDIDATE_TOURNAMENT_NAMES.has(normalizeKey(name))) return "candidate";
    if (status === "live" || status === "upcoming") return "candidate";
  }

  return "confirmed";
}

function getReferences(entityType: VerifiedEntityType, entityId: string) {
  return SOURCE_REFERENCES.filter(
    (reference) =>
      reference.entityType === entityType &&
      normalizeKey(reference.entityId) === normalizeKey(entityId)
  );
}

function getRecentChangeIds(entityType: VerifiedEntityType, entityId: string) {
  return APPROVED_CHANGES.filter(
    (change) =>
      change.public &&
      change.entityType === entityType &&
      normalizeKey(change.entityId) === normalizeKey(entityId)
  )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((change) => change.id);
}

function buildVerificationSummary(
  entityType: VerifiedEntityType,
  entityId: string,
  canonicalStatus: CanonicalStatus,
  status?: Tournament["status"],
  name?: string
): VerificationSummary {
  const references = getReferences(entityType, entityId).sort((a, b) =>
    b.verifiedAt.localeCompare(a.verifiedAt)
  );
  const derivedCanonicalStatus =
    references.length > 0
      ? canonicalStatus
      : getDefaultCanonicalStatus(entityType, entityId, status, name);

  return {
    sourceCount: references.length,
    lastVerifiedAt: references[0]?.verifiedAt ?? null,
    canonicalStatus: derivedCanonicalStatus,
    references,
  };
}

export function getTrackedSources(): Source[] {
  return TRACKED_SOURCES;
}

export function getSourceById(sourceId: string): Source | undefined {
  return TRACKED_SOURCES.find((source) => source.id === sourceId);
}

export function getSourceReferenceById(referenceId: string): SourceReference | undefined {
  return SOURCE_REFERENCES.find((reference) => reference.id === referenceId);
}

export function getEntityVerificationSummary(
  entityType: VerifiedEntityType,
  entityId: string
): VerificationSummary {
  return buildVerificationSummary(
    entityType,
    entityId,
    getDefaultCanonicalStatus(entityType, entityId)
  );
}

export function mergePlayerTruth(players: Player[]): Player[] {
  return players.map((player) => {
    const verification = buildVerificationSummary("player", player.id, "confirmed");
    return {
      ...player,
      role: PLAYER_ROLE_OVERRIDES[player.id] ?? player.role,
      canonicalStatus: verification.canonicalStatus,
      lastVerifiedAt: verification.lastVerifiedAt,
      sourceReferences: verification.references,
      recentChangeIds: getRecentChangeIds("player", player.id),
    };
  });
}

export function mergeStaffTruth(staff: StaffMember[]): StaffMember[] {
  return staff.map((member) => {
    const verification = buildVerificationSummary("staff", member.id, "confirmed");
    return {
      ...member,
      role: STAFF_ROLE_OVERRIDES[member.id] ?? member.role,
      canonicalStatus: verification.canonicalStatus,
      lastVerifiedAt: verification.lastVerifiedAt,
      sourceReferences: verification.references,
      recentChangeIds: getRecentChangeIds("staff", member.id),
    };
  });
}

export function mergeTournamentTruth(tournaments: Tournament[]): Tournament[] {
  return tournaments.map((tournament) => {
    const canonicalStatus = getDefaultCanonicalStatus(
      "tournament",
      tournament.id,
      tournament.status,
      tournament.name
    );
    const verification = buildVerificationSummary(
      "tournament",
      tournament.id,
      canonicalStatus,
      tournament.status,
      tournament.name
    );

    return {
      ...tournament,
      canonicalStatus: verification.canonicalStatus,
      lastVerifiedAt: verification.lastVerifiedAt,
      sourceReferences: verification.references,
      recentChangeIds: getRecentChangeIds("tournament", tournament.id),
    };
  });
}

export function getCanonicalTournaments(tournaments: Tournament[]): Tournament[] {
  return tournaments.filter((tournament) => tournament.canonicalStatus === "confirmed");
}

export function getRecentApprovedChanges(limit = 6): ApprovedChange[] {
  return [...APPROVED_CHANGES]
    .filter((change) => change.public)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function getApprovedChangesForEntity(
  entityType: VerifiedEntityType,
  entityId: string
): ApprovedChange[] {
  return APPROVED_CHANGES.filter(
    (change) =>
      change.public &&
      change.entityType === entityType &&
      normalizeKey(change.entityId) === normalizeKey(entityId)
  ).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getUpdateCandidates(limit = 12): UpdateCandidate[] {
  return [...UPDATE_CANDIDATES]
    .sort((a, b) => b.proposedAt.localeCompare(a.proposedAt))
    .slice(0, limit);
}

export function buildPlayerRosterEvents(player: Player): RosterEvent[] {
  const events: RosterEvent[] = [];

  player.stints.forEach((stint, index) => {
    events.push({
      id: `${player.id}-joined-${index}`,
      playerId: player.id,
      type: index === 0 ? "joined" : "returned",
      date: stint.joinDate,
      title: index === 0 ? "Joined Team SouL" : "Returned to Team SouL",
      description: stint.joinContext,
      eraId: stint.era,
    });

    if (stint.leaveDate) {
      events.push({
        id: `${player.id}-left-${index}`,
        playerId: player.id,
        type: "left",
        date: stint.leaveDate,
        title: "Left active roster",
        description: stint.leaveReason ?? "Roster exit recorded in archive history.",
        eraId: stint.era,
      });
    }
  });

  player.awards.forEach((award, index) => {
    events.push({
      id: `${player.id}-award-${index}`,
      playerId: player.id,
      type: "award",
      date: player.lastVerifiedAt ?? "2026-04-29",
      title: award.name,
      description: `${award.recipient} • ${award.tournament}`,
      tournamentId: award.tournament,
    });
  });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function buildPlayerProfile(player: Player): PlayerProfile {
  const canonicalStatus = player.canonicalStatus ?? "confirmed";
  const verification = buildVerificationSummary("player", player.id, canonicalStatus);
  return {
    player: {
      ...player,
      canonicalStatus,
      lastVerifiedAt: player.lastVerifiedAt ?? verification.lastVerifiedAt,
      sourceReferences: player.sourceReferences ?? verification.references,
      recentChangeIds: player.recentChangeIds ?? getRecentChangeIds("player", player.id),
    },
    verification,
    recentChanges: getApprovedChangesForEntity("player", player.id),
    rosterEvents: buildPlayerRosterEvents(player),
  };
}

export function buildStaffProfile(member: StaffMember): StaffProfile {
  const canonicalStatus = member.canonicalStatus ?? "confirmed";
  const verification = buildVerificationSummary("staff", member.id, canonicalStatus);
  return {
    staff: {
      ...member,
      canonicalStatus,
      lastVerifiedAt: member.lastVerifiedAt ?? verification.lastVerifiedAt,
      sourceReferences: member.sourceReferences ?? verification.references,
      recentChangeIds: member.recentChangeIds ?? getRecentChangeIds("staff", member.id),
    },
    verification,
    recentChanges: getApprovedChangesForEntity("staff", member.id),
  };
}

export function buildTournamentDetail(
  tournament: Tournament,
  players: Player[],
  mediaCollection?: MediaCollection | null
): TournamentDetail {
  const canonicalStatus =
    tournament.canonicalStatus ??
    getDefaultCanonicalStatus("tournament", tournament.id, tournament.status, tournament.name);
  const verification = buildVerificationSummary(
    "tournament",
    tournament.id,
    canonicalStatus,
    tournament.status,
    tournament.name
  );
  const rosterPlayers = (tournament.roster ?? [])
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter((player): player is Player => Boolean(player));

  return {
    tournament: {
      ...tournament,
      canonicalStatus,
      lastVerifiedAt: tournament.lastVerifiedAt ?? verification.lastVerifiedAt,
      sourceReferences: tournament.sourceReferences ?? verification.references,
      recentChangeIds:
        tournament.recentChangeIds ?? getRecentChangeIds("tournament", tournament.id),
    },
    verification,
    recentChanges: getApprovedChangesForEntity("tournament", tournament.id),
    rosterPlayers,
    mediaCollection: mediaCollection ?? null,
  };
}

export function buildMediaCollection(
  id: string,
  title: string,
  description: string,
  assets: MediaAsset[],
  tournamentId?: string
): MediaCollection {
  return {
    id,
    title,
    description,
    assets,
    tournamentId,
  };
}
