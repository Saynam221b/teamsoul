import type { Tournament } from "../data/types";

export type TournamentLifecycleStatus = NonNullable<Tournament["status"]>;

type TournamentLifecycleInput = {
  status: TournamentLifecycleStatus;
  placement: string | null;
  isWin: boolean;
  rosterIds: string[];
};

export function isCompletedStatus(
  status: Tournament["status"] | undefined
): status is "completed" {
  return status === "completed";
}

export function isCompletedTournament(
  tournament: Pick<Tournament, "status">
): boolean {
  return isCompletedStatus(tournament.status);
}

export function isCompletedWin(
  tournament: Pick<Tournament, "status" | "isWin">
): boolean {
  return isCompletedStatus(tournament.status) && tournament.isWin;
}

export function getCompletedTournaments(tournaments: Tournament[]): Tournament[] {
  return tournaments.filter((tournament) => isCompletedTournament(tournament));
}

export function getChampionshipTournaments(tournaments: Tournament[]): Tournament[] {
  return tournaments.filter((tournament) => isCompletedWin(tournament));
}

export function normalizeTournamentLifecycleInput(
  input: TournamentLifecycleInput
): TournamentLifecycleInput {
  if (input.status !== "completed") {
    return {
      status: input.status,
      placement: null,
      isWin: false,
      rosterIds: input.rosterIds,
    };
  }

  return {
    status: input.status,
    placement: input.placement?.trim() || null,
    isWin: input.isWin,
    rosterIds: input.rosterIds,
  };
}
