export const TROPHY_ROOM_TOURNAMENT_IDS = [
  "pmis-2019",
  "pmco-spring-india-2019",
  "bmps-s1-2022",
  "bgms-s3-2024",
  "bgis-2026",
] as const;

const TROPHY_ROOM_ID_SET = new Set<string>(TROPHY_ROOM_TOURNAMENT_IDS);

export function isCuratedTrophyTournament(id: string): boolean {
  return TROPHY_ROOM_ID_SET.has(id);
}
