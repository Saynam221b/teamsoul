// ============================================================================
// Data Helpers — Query, filter, and aggregate functions for the SouL Archive.
// ============================================================================

import archiveData from "./data.json";
import type {
  SoulArchive,
  Tournament,
  Player,
  Era,
  RosterSnapshot,
  RosterChange,
} from "./types";

const data = archiveData as unknown as SoulArchive;

// ---------------------------------------------------------------------------
// Full Archive
// ---------------------------------------------------------------------------
export function getArchive(): SoulArchive {
  return data;
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------
export function getOrganization() {
  return data.organization;
}

// ---------------------------------------------------------------------------
// Tournaments
// ---------------------------------------------------------------------------
export function getAllTournaments(): Tournament[] {
  return data.tournaments;
}

export function getTournamentsByYear(year: number): Tournament[] {
  return data.tournaments
    .filter((t) => t.year === year)
    .sort((a, b) => (a.month ?? 0) - (b.month ?? 0));
}

export function getTournamentsByTier(
  tier: Tournament["tier"]
): Tournament[] {
  return data.tournaments.filter((t) => t.tier === tier);
}

export function getWins(): Tournament[] {
  return data.tournaments.filter((t) => t.isWin);
}

export function getWinsByTier(tier: Tournament["tier"]): Tournament[] {
  return data.tournaments.filter((t) => t.isWin && t.tier === tier);
}

export function getMajorWins(): Tournament[] {
  return data.tournaments.filter(
    (t) => t.isWin && (t.tier === "S-Tier" || t.tier === "A-Tier")
  );
}

export function getTournamentById(id: string): Tournament | undefined {
  return data.tournaments.find((t) => t.id === id);
}

export function getYears(): number[] {
  const years = new Set(data.tournaments.map((t) => t.year));
  return Array.from(years).sort((a, b) => a - b);
}

export function getTotalPrize(): number {
  return data.tournaments.reduce((sum, t) => sum + (t.prize ?? 0), 0);
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------
export function getAllPlayers(): Player[] {
  return Object.values(data.players);
}

export function getPlayerById(id: string): Player | undefined {
  return data.players[id];
}

export function getActivePlayers(): Player[] {
  return Object.values(data.players).filter((p) => p.isActive);
}

export function getFounders(): Player[] {
  return Object.values(data.players).filter((p) => p.isFounder);
}

export function getPlayersByEra(eraId: string): Player[] {
  return Object.values(data.players).filter((p) =>
    p.stints.some((s) => s.era === eraId)
  );
}

// ---------------------------------------------------------------------------
// Eras
// ---------------------------------------------------------------------------
export function getEras(): Era[] {
  return data.eras;
}

export function getEraById(id: string): Era | undefined {
  return data.eras.find((e) => e.id === id);
}

export function getEraForYear(year: number): Era | undefined {
  return data.eras.find(
    (e) => year >= e.yearRange[0] && year <= e.yearRange[1]
  );
}

// ---------------------------------------------------------------------------
// Roster
// ---------------------------------------------------------------------------
export function getRosterSnapshots(): RosterSnapshot[] {
  return data.rosterSnapshots;
}

export function getRosterChanges(): RosterChange[] {
  return data.rosterChanges;
}

export function getCurrentRoster(): string[] {
  const active = getActivePlayers();
  return active.map((p) => p.id);
}

// ---------------------------------------------------------------------------
// Aggregate Stats
// ---------------------------------------------------------------------------
export function getStats() {
  return data.stats;
}

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------
export function formatPrize(amount: number | null): string {
  if (amount === null || amount === 0) return "—";
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatPlacement(placement: number | string): string {
  if (typeof placement === "string") return placement;
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const suffix = suffixes[placement] || "th";
  return `${placement}${suffix}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMonthName(month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[month - 1] || "";
}
