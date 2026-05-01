import type {
  ApprovedChange,
  Source,
  SourceReference,
  UpdateCandidate,
} from "@/data/types";

export const TRACKED_SOURCES: Source[] = [
  {
    id: "official-team-soul-instagram",
    name: "Team SouL Official Instagram",
    sourceType: "official",
    baseUrl: "https://www.instagram.com/iqoosoul/",
    note: "Primary roster and announcement channel.",
  },
  {
    id: "official-s8ul-instagram",
    name: "S8UL Official Instagram",
    sourceType: "official",
    baseUrl: "https://www.instagram.com/s8ul.esports/",
    note: "Organization-wide official posts.",
  },
  {
    id: "krafton-india-esports",
    name: "KRAFTON India Esports",
    sourceType: "official_tournament",
    baseUrl: "https://esports.krafton.in/",
    note: "Primary official tournament verification source.",
  },
  {
    id: "liquipedia-team-soul",
    name: "Liquipedia Team SouL",
    sourceType: "wiki",
    baseUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
  },
  {
    id: "liquipedia-team-soul-results",
    name: "Liquipedia Team SouL Results",
    sourceType: "wiki",
    baseUrl: "https://liquipedia.net/pubgmobile/Team_SouL/Results",
  },
  {
    id: "talkesport-bmps-2026",
    name: "TalkEsport BMPS 2026 overview",
    sourceType: "report",
    baseUrl: "https://www.talkesport.com/news/bmps-2026-everything-we-know-so-far/",
    note: "Useful watchlist source, not canonical by itself.",
  },
];

export const SOURCE_REFERENCES: SourceReference[] = [
  {
    id: "tournament-bgis-2026-krafton",
    entityType: "tournament",
    entityId: "bgis-2026",
    sourceId: "krafton-india-esports",
    sourceUrl: "https://esports.krafton.in/",
    sourceType: "official_tournament",
    title: "BGIS 2026 official final result",
    verifiedAt: "2026-04-29",
    confidence: "high",
    notes: "Primary official event verification.",
  },
  {
    id: "tournament-bgis-2026-liquipedia",
    entityType: "tournament",
    entityId: "bgis-2026",
    sourceId: "liquipedia-team-soul-results",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL/Results",
    sourceType: "wiki",
    title: "Team SouL results page includes BGIS 2026 1st place",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "organization-team-soul-liquipedia",
    entityType: "organization",
    entityId: "team-soul",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Team overview, winnings, and active lineup",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "player-nakul-liquipedia",
    entityType: "player",
    entityId: "nakul",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Active captain listing for NakuL",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "player-goblin-liquipedia",
    entityType: "player",
    entityId: "goblin",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Active lineup listing for Goblin",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "player-legit-liquipedia",
    entityType: "player",
    entityId: "legit",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Active lineup listing for LEGIT",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "player-jokerr-liquipedia",
    entityType: "player",
    entityId: "jokerr",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Active lineup listing for Jokerr",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "player-thunder-liquipedia",
    entityType: "player",
    entityId: "thunder",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Active lineup listing for Thunder",
    verifiedAt: "2026-04-29",
    confidence: "high",
  },
  {
    id: "staff-ayogi-liquipedia",
    entityType: "staff",
    entityId: "ayogi",
    sourceId: "liquipedia-team-soul",
    sourceUrl: "https://liquipedia.net/pubgmobile/Team_SouL",
    sourceType: "wiki",
    title: "Coach listing for Ayogi",
    verifiedAt: "2026-04-29",
    confidence: "medium",
  },
  {
    id: "candidate-bmps-2026-report",
    entityType: "tournament",
    entityId: "bmps-2026",
    sourceId: "talkesport-bmps-2026",
    sourceUrl: "https://www.talkesport.com/news/bmps-2026-everything-we-know-so-far/",
    sourceType: "report",
    title: "BMPS 2026 qualification outlook after BGIS 2026",
    verifiedAt: "2026-05-01",
    confidence: "medium",
    notes: "Watchlist only until official Team SouL participation is confirmed.",
  },
];

export const APPROVED_CHANGES: ApprovedChange[] = [
  {
    id: "canonical-reset-apr-2026",
    entityType: "tournament",
    entityId: "team-soul-tournaments",
    kind: "system",
    title: "Canonical tournament board reset",
    summary:
      "Speculative live and upcoming entries were moved out of the public archive until official confirmation is available.",
    publishedAt: "2026-04-30",
    href: "/updates",
    canonicalStatus: "confirmed",
    sourceReferenceIds: ["candidate-bmps-2026-report", "organization-team-soul-liquipedia"],
    public: true,
  },
  {
    id: "bgis-2026-title-verified",
    entityType: "tournament",
    entityId: "bgis-2026",
    kind: "result",
    title: "BGIS 2026 championship locked",
    summary:
      "BGIS 2026 first place, prize, and award context were re-verified and promoted as the modern flagship title run.",
    publishedAt: "2026-04-29",
    effectiveDate: "2026-03-29",
    href: "/tournaments/bgis-2026",
    canonicalStatus: "confirmed",
    sourceReferenceIds: ["tournament-bgis-2026-krafton", "tournament-bgis-2026-liquipedia"],
    public: true,
  },
  {
    id: "thunder-active-core-verified",
    entityType: "player",
    entityId: "thunder",
    kind: "roster",
    title: "Thunder active-core profile verified",
    summary:
      "Thunder remains in the active five and is now treated as part of the public verified roster core.",
    publishedAt: "2026-04-29",
    effectiveDate: "2025-09-20",
    href: "/roster/thunder",
    canonicalStatus: "confirmed",
    sourceReferenceIds: ["player-thunder-liquipedia"],
    public: true,
  },
  {
    id: "ayogi-coaching-line-verified",
    entityType: "staff",
    entityId: "ayogi",
    kind: "staff",
    title: "Ayogi coaching lane verified",
    summary:
      "The modern Team SouL chapter now treats Ayogi as explicit coaching/staff context instead of background copy only.",
    publishedAt: "2026-04-28",
    effectiveDate: "2025-07-28",
    href: "/bgis-champions",
    canonicalStatus: "confirmed",
    sourceReferenceIds: ["staff-ayogi-liquipedia"],
    public: true,
  },
];

export const UPDATE_CANDIDATES: UpdateCandidate[] = [
  {
    id: "candidate-bmps-2026-team-soul-slot",
    entityType: "tournament",
    entityId: "bmps-2026",
    title: "BMPS 2026 slot watchlist",
    summary:
      "Multiple secondary sources expect Team SouL to carry a BMPS 2026 place from BGIS 2026, but the public archive should wait for official tournament or Team SouL confirmation.",
    candidateStatus: "ready_for_review",
    proposedAt: "2026-05-01",
    sourceReferenceIds: ["candidate-bmps-2026-report"],
  },
];

export const CONFIRMED_UPCOMING_TOURNAMENT_IDS = new Set<string>([]);

export const CANDIDATE_TOURNAMENT_IDS = new Set<string>(["bmps-2026"]);

export const CANDIDATE_TOURNAMENT_NAMES = new Set<string>([
  "summer championship series",
  "bgmi pro series 2026",
  "bgms 2026 season 4",
  "krafton community event 4",
  "snapdragon pro series 2026",
  "bgmi showdown 2026",
  "bgmi international cup 2026",
  "bgis 2027: the grind",
  "battlegrounds mobile india pro series 2026",
]);

export const PLAYER_ROLE_OVERRIDES: Record<string, string> = {
  legit: "Fragger",
};

export const STAFF_ROLE_OVERRIDES: Record<string, string> = {
  ayogi: "Coach",
};
