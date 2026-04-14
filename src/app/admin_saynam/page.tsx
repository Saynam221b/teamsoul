"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { formatDate, formatPrize, getMonthName } from "@/data/helpers";
import type {
  AdminPlayerOption,
  AdminTournament,
  CompleteTournamentInput,
  CreateUpcomingTournamentInput,
  Tournament,
  UpdateTournamentInput,
} from "@/data/types";

type DbHealth = {
  schemaReady: boolean;
  seeded: boolean;
  fallbackActive: boolean;
  tableCounts: Record<string, number>;
  tableErrors?: Record<string, string>;
  setupChecklist?: {
    schemaApplied: boolean;
    seedRun: boolean;
    keyTablesReady: boolean;
  };
  error?: string;
};

type AdminFilter = "upcoming" | "live" | "completed";
type ModalMode = "create" | "edit" | "complete";

type TournamentFormState = {
  status: "upcoming" | "live";
  name: string;
  tier: Tournament["tier"];
  year: string;
  month: string;
  eventDate: string;
  location: string;
  approxPrize: string;
  details: string;
  placement: string;
  isWin: boolean;
  rosterIds: string[];
};

const TIER_OPTIONS: Tournament["tier"][] = [
  "S-Tier",
  "A-Tier",
  "B-Tier",
  "C-Tier",
  "Qualifier",
  "Showmatch",
];

const EMPTY_FORM: TournamentFormState = {
  status: "upcoming",
  name: "",
  tier: "S-Tier",
  year: "",
  month: "",
  eventDate: "",
  location: "",
  approxPrize: "",
  details: "",
  placement: "",
  isWin: false,
  rosterIds: [],
};

function toFormState(tournament: AdminTournament): TournamentFormState {
  return {
    status: tournament.status === "live" ? "live" : "upcoming",
    name: tournament.name,
    tier: tournament.tier,
    year: String(tournament.year),
    month: tournament.month ? String(tournament.month) : "",
    eventDate: tournament.eventDate ?? "",
    location: tournament.location ?? "",
    approxPrize:
      tournament.approxPrize === null || tournament.approxPrize === undefined
        ? ""
        : String(tournament.approxPrize),
    details: tournament.details ?? "",
    placement: tournament.placement ?? "",
    isWin: tournament.isWin,
    rosterIds: tournament.rosterIds ?? [],
  };
}

function buildBasePayload(
  form: TournamentFormState
): Omit<CreateUpcomingTournamentInput, "name" | "tier" | "year"> & {
  name: string;
  tier: Tournament["tier"];
  year: number;
} {
  return {
    name: form.name.trim(),
    tier: form.tier,
    year: Number(form.year || "0"),
    status: form.status,
    month: form.month ? Number(form.month) : null,
    eventDate: form.eventDate.trim() || null,
    location: form.location.trim() || null,
    approxPrize: form.approxPrize.trim() ? Number(form.approxPrize) : null,
    details: form.details.trim() || null,
  };
}

function tournamentStamp(tournament: AdminTournament) {
  if (tournament.eventDate) {
    return formatDate(tournament.eventDate);
  }

  if (tournament.month) {
    return `${getMonthName(tournament.month)} ${tournament.year}`;
  }

  return String(tournament.year);
}

function getStatusTone(status: AdminFilter | NonNullable<Tournament["status"]>) {
  if (status === "live") {
    return "border-energy/30 bg-energy/10 text-energy";
  }

  if (status === "upcoming") {
    return "border-accent/30 bg-accent/10 text-accent";
  }

  return "border-gold/30 bg-gold/10 text-gold";
}

function getStatusLabel(status: NonNullable<Tournament["status"]> | AdminFilter) {
  return status === "live" ? "ongoing" : status;
}

function getPlayerTone(player: AdminPlayerOption, selected: boolean) {
  if (selected) {
    return "border-accent/30 bg-accent/10 text-white";
  }

  if (player.isActive) {
    return "border-white/10 bg-white/[0.03] text-text-primary";
  }

  return "border-white/8 bg-black/15 text-text-secondary";
}

function TournamentModal({
  mode,
  form,
  players,
  includeCompletionFields,
  saving,
  onClose,
  onSubmit,
  onChange,
}: {
  mode: ModalMode;
  form: TournamentFormState;
  players: AdminPlayerOption[];
  includeCompletionFields: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof TournamentFormState>(
    key: K,
    value: TournamentFormState[K]
  ) => void;
}) {
  const requiresResults = includeCompletionFields;
  const creationLabel = form.status === "live" ? "Ongoing" : "Upcoming";
  const title =
    mode === "create"
      ? `Add New ${creationLabel} Tournament`
      : mode === "complete"
        ? "Complete Tournament"
        : includeCompletionFields
          ? "Edit Completed Tournament"
          : `Edit ${form.status === "live" ? "Ongoing" : "Upcoming"} Tournament`;

  return (
    <div className="fixed inset-0 z-[140] bg-black/75 px-4 py-8 backdrop-blur-sm md:px-6">
      <div className="mx-auto max-h-full w-full max-w-5xl overflow-auto rounded-[30px] border border-white/10 bg-[#07111b] shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
        <form onSubmit={onSubmit} className="p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-4 md:pb-5">
            <div>
              <p className="section-kicker mb-2">Tournament control</p>
              <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                {mode === "create"
                  ? `Create a ${creationLabel.toLowerCase()} event through form inputs only. The system generates the tournament ID and stores the normalized payload in Supabase.`
                  : mode === "complete"
                    ? "Add placement and roster details, then move the event from upcoming or ongoing into completed results in one save."
                    : "Update tournament details through the same form-driven flow. No raw JSON editing is exposed."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Tournament Name
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Tier
                  </span>
                  <select
                    value={form.tier}
                    onChange={(event) =>
                      onChange("tier", event.target.value as Tournament["tier"])
                    }
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                  >
                    {TIER_OPTIONS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Event Date
                  </span>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(event) => onChange("eventDate", event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Year
                  </span>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(event) => onChange("year", event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                    min="2018"
                    max="2100"
                    required={!form.eventDate}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Month
                  </span>
                  <input
                    type="number"
                    value={form.month}
                    onChange={(event) => onChange("month", event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                    min="1"
                    max="12"
                    placeholder="Optional"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Location
                  </span>
                  <input
                    value={form.location}
                    onChange={(event) => onChange("location", event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                    placeholder="Online or venue"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Approx Prize (USD)
                  </span>
                  <input
                    type="number"
                    value={form.approxPrize}
                    onChange={(event) => onChange("approxPrize", event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                    min="0"
                    step="1"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  Notes
                </span>
                <textarea
                  value={form.details}
                  onChange={(event) => onChange("details", event.target.value)}
                  className="min-h-32 w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                  placeholder="Optional context, schedule notes, or completion summary"
                />
              </label>
            </section>

            <section className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  Save behavior
                </p>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  {requiresResults
                    ? "This save updates the tournament row and keeps its normalized data in Supabase."
                    : `This save creates the tournament as ${creationLabel.toLowerCase()} with a generated ID, no placement, and no roster links yet.`}
                </p>
              </div>

              {requiresResults ? (
                <>
                  <label className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                      Placement
                    </span>
                    <input
                      value={form.placement}
                      onChange={(event) => onChange("placement", event.target.value)}
                      className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                      placeholder="1 or 7th or Finals"
                      required
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={form.isWin}
                      onChange={(event) => onChange("isWin", event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent"
                    />
                    Mark this event as a title win
                  </label>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                          Roster
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                          Select the players tied to this completed tournament.
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                        {form.rosterIds.length} selected
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {players.map((player) => {
                        const selected = form.rosterIds.includes(player.id);
                        return (
                          <label
                            key={player.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-[18px] border px-3 py-3 transition-colors ${getPlayerTone(
                              player,
                              selected
                            )}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(event) => {
                                const nextIds = event.target.checked
                                  ? [...form.rosterIds, player.id]
                                  : form.rosterIds.filter((id) => id !== player.id);
                                onChange("rosterIds", nextIds);
                              }}
                              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">{player.displayName}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-text-muted">
                                {player.role}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </section>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/8 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary px-5 text-sm"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="button-primary px-5 text-sm">
              {saving
                ? "Saving..."
                : mode === "create"
                  ? `Create ${creationLabel} Tournament`
                  : mode === "complete"
                    ? "Save And Move To Completed"
                    : "Save Tournament Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSaynamPage() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AdminFilter>("upcoming");
  const [players, setPlayers] = useState<AdminPlayerOption[]>([]);
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [activeTournament, setActiveTournament] = useState<AdminTournament | null>(null);
  const [form, setForm] = useState<TournamentFormState>(EMPTY_FORM);
  const [statusActionId, setStatusActionId] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = window.sessionStorage.getItem("admin_saynam_auth");
    const savedPassword = window.sessionStorage.getItem("admin_saynam_pwd");
    if (savedAuth === "1" && savedPassword) {
      setPassword(savedPassword);
      setAuthorized(true);
    }
  }, []);

  const authHeaders = useMemo(() => ({ "x-admin-password": password }), [password]);

  const loadAdminData = useCallback(async () => {
    if (!authorized) return;

    setLoading(true);
    setError("");

    try {
      const [healthResponse, tournamentsResponse, playersResponse] = await Promise.all([
        fetch("/api/admin/db-health", { headers: authHeaders }),
        fetch("/api/admin/tournaments", { headers: authHeaders }),
        fetch("/api/admin/players", { headers: authHeaders }),
      ]);

      const [healthData, tournamentsData, playersData] = await Promise.all([
        healthResponse.json() as Promise<DbHealth & { error?: string }>,
        tournamentsResponse.json() as Promise<{ tournaments?: AdminTournament[]; error?: string }>,
        playersResponse.json() as Promise<{ players?: AdminPlayerOption[]; error?: string }>,
      ]);

      if (!healthResponse.ok) {
        throw new Error(healthData.error || "Could not load database health");
      }
      if (!tournamentsResponse.ok) {
        throw new Error(tournamentsData.error || "Could not load tournaments");
      }
      if (!playersResponse.ok) {
        throw new Error(playersData.error || "Could not load players");
      }

      setDbHealth(healthData);
      setTournaments(tournamentsData.tournaments ?? []);
      setPlayers(playersData.players ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, authorized]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const upcomingCount = useMemo(
    () => tournaments.filter((item) => item.status === "upcoming").length,
    [tournaments]
  );
  const ongoingCount = useMemo(
    () => tournaments.filter((item) => item.status === "live").length,
    [tournaments]
  );
  const completedCount = useMemo(
    () => tournaments.filter((item) => item.status === "completed").length,
    [tournaments]
  );

  const filteredTournaments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tournaments.filter((item) => {
      if (item.status !== filter) return false;
      if (!term) return true;
      return item.name.toLowerCase().includes(term);
    });
  }, [filter, search, tournaments]);

  const sortedPlayers = useMemo(
    () =>
      [...players].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      }),
    [players]
  );

  function resetModal() {
    setModalMode(null);
    setActiveTournament(null);
    setForm(EMPTY_FORM);
  }

  function openCreateModal(status: "upcoming" | "live") {
    setNotice("");
    setError("");
    setActiveTournament(null);
    setForm({ ...EMPTY_FORM, status });
    setModalMode("create");
  }

  function openEditModal(tournament: AdminTournament) {
    setNotice("");
    setError("");
    setActiveTournament(tournament);
    setForm(toFormState(tournament));
    setModalMode("edit");
  }

  function openCompleteModal(tournament: AdminTournament) {
    setNotice("");
    setError("");
    setActiveTournament(tournament);
    setForm(toFormState(tournament));
    setModalMode("complete");
  }

  function updateForm<K extends keyof TournamentFormState>(
    key: K,
    value: TournamentFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/db-health", {
        headers: { "x-admin-password": password },
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Wrong password.");
      }

      window.sessionStorage.setItem("admin_saynam_auth", "1");
      window.sessionStorage.setItem("admin_saynam_pwd", password);
      setAuthorized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.sessionStorage.removeItem("admin_saynam_auth");
    window.sessionStorage.removeItem("admin_saynam_pwd");
    setAuthorized(false);
    setPassword("");
    setPlayers([]);
    setTournaments([]);
    setDbHealth(null);
    setError("");
    setNotice("");
    resetModal();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modalMode) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const basePayload = buildBasePayload(form);
      let response: Response;

      if (modalMode === "create") {
        const payload: CreateUpcomingTournamentInput = basePayload;
        response = await fetch("/api/admin/tournaments", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify(payload),
        });
      } else if (modalMode === "complete" && activeTournament) {
        const payload: CompleteTournamentInput = {
          ...basePayload,
          placement: form.placement.trim(),
          isWin: form.isWin,
          rosterIds: form.rosterIds,
        };
        response = await fetch(`/api/admin/tournaments/${activeTournament.id}/complete`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify(payload),
        });
      } else if (activeTournament) {
        const payload: UpdateTournamentInput = {
          ...basePayload,
          placement: form.placement.trim() || null,
          isWin: form.isWin,
          rosterIds: form.rosterIds,
        };
        response = await fetch(`/api/admin/tournaments/${activeTournament.id}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify(payload),
        });
      } else {
        throw new Error("No active tournament selected");
      }

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Save failed");
      }

      await loadAdminData();
      setNotice(
        modalMode === "create"
          ? `${form.status === "live" ? "Ongoing" : "Upcoming"} tournament created.`
          : modalMode === "complete"
            ? "Tournament completed and moved into results."
            : "Tournament updated."
      );
      resetModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveToOngoing(tournament: AdminTournament) {
    setStatusActionId(tournament.id);
    setError("");
    setNotice("");

    try {
      const payload: UpdateTournamentInput = {
        ...buildBasePayload(toFormState(tournament)),
        status: "live",
        placement: tournament.placement,
        isWin: tournament.isWin,
        rosterIds: tournament.rosterIds,
      };

      const response = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not move tournament to ongoing");
      }

      await loadAdminData();
      setNotice("Tournament moved to ongoing.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move tournament to ongoing");
    } finally {
      setStatusActionId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1 pt-28 md:pt-32">
        <section className="archive-section !pt-0">
          <div className="page-wrap space-y-6">
            <div className="inner-hero rounded-[32px] px-5 py-7 md:px-10 md:py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="section-kicker">Admin control</p>
                  <h1 className="section-title">Tournament command board</h1>
                  <p className="section-copy">
                    Add upcoming or ongoing tournaments, then move them through completion with
                    structured form inputs only. Raw JSON row editing stays out of the loop.
                  </p>
                </div>

                {authorized ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openCreateModal("upcoming")}
                      className="button-primary"
                    >
                      Add New Upcoming Tournament
                    </button>
                    <button
                      type="button"
                      onClick={() => openCreateModal("live")}
                      className="button-secondary"
                    >
                      Add Ongoing Tournament
                    </button>
                    <button type="button" onClick={handleLogout} className="button-secondary">
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {!authorized ? (
              <form
                onSubmit={handleLogin}
                className="archive-panel mx-auto max-w-lg rounded-[28px] p-6 md:p-7"
              >
                <p className="section-kicker">Access</p>
                <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
                  Enter Admin Password
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  This password gates the tournament control center and the supporting admin APIs.
                </p>

                <label className="mt-6 block space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                    required
                  />
                </label>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="submit" disabled={loading} className="button-primary">
                    {loading ? "Checking..." : "Enter Admin"}
                  </button>
                </div>

                {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
              </form>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <article className="archive-panel rounded-[24px] p-5">
                    <p className="section-kicker">Ongoing</p>
                    <p className="font-display text-4xl uppercase leading-none text-energy md:text-5xl">
                      {ongoingCount}
                    </p>
                  </article>
                  <article className="archive-panel rounded-[24px] p-5">
                    <p className="section-kicker">Upcoming</p>
                    <p className="font-display text-4xl uppercase leading-none text-accent md:text-5xl">
                      {upcomingCount}
                    </p>
                  </article>
                  <article className="archive-panel rounded-[24px] p-5">
                    <p className="section-kicker">Completed</p>
                    <p className="font-display text-4xl uppercase leading-none text-gold md:text-5xl">
                      {completedCount}
                    </p>
                  </article>
                  <article className="archive-panel rounded-[24px] p-5">
                    <p className="section-kicker">Players</p>
                    <p className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                      {players.length}
                    </p>
                  </article>
                  <article className="archive-panel rounded-[24px] p-5">
                    <p className="section-kicker">Schema</p>
                    <p className="font-display text-3xl uppercase leading-none text-white md:text-4xl">
                      {dbHealth?.schemaReady ? "Ready" : "Pending"}
                    </p>
                  </article>
                </div>

                <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="archive-panel rounded-[28px] p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Setup</p>
                        <h2 className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                          Database Health
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadAdminData()}
                        className="button-secondary px-4 text-xs"
                      >
                        {loading ? "Refreshing..." : "Refresh"}
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                          dbHealth?.schemaReady
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        Schema {dbHealth?.schemaReady ? "Ready" : "Missing"}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                          dbHealth?.seeded
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        Seed {dbHealth?.seeded ? "Ready" : "Pending"}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                          dbHealth?.fallbackActive
                            ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                            : "border-white/10 bg-white/[0.03] text-text-secondary"
                        }`}
                      >
                        Fallback {dbHealth?.fallbackActive ? "Active" : "Off"}
                      </span>
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                      <li>
                        {dbHealth?.setupChecklist?.schemaApplied ? "✅" : "⬜"} Apply
                        <code className="mx-1">supabase/schema.sql</code>
                      </li>
                      <li>
                        {dbHealth?.setupChecklist?.seedRun ? "✅" : "⬜"} Run
                        <code className="mx-1">npm run db:migrate:supabase</code>
                      </li>
                      <li>
                        {dbHealth?.setupChecklist?.keyTablesReady ? "✅" : "⬜"} Verify tournaments,
                        players, and eras
                      </li>
                    </ul>
                  </div>

                  <div className="archive-panel rounded-[28px] p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="section-kicker">Tournament flow</p>
                        <h2 className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                          Manage By Status
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(["live", "upcoming", "completed"] as AdminFilter[]).map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                              filter === value
                                ? getStatusTone(value)
                                : "border-white/10 bg-white/[0.03] text-text-secondary"
                            }`}
                          >
                            {getStatusLabel(value)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                      <label className="space-y-2">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                          Search tournaments
                        </span>
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          className="w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
                          placeholder="Filter by tournament name"
                        />
                      </label>

                      <div className="grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => openCreateModal("upcoming")}
                          className="button-primary w-full"
                        >
                          Add New Upcoming Tournament
                        </button>
                        <button
                          type="button"
                          onClick={() => openCreateModal("live")}
                          className="button-secondary w-full"
                        >
                          Add Ongoing Tournament
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {error ? (
                  <div className="archive-panel rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}
                {notice ? (
                  <div className="archive-panel rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    {notice}
                  </div>
                ) : null}

                <section className="archive-panel rounded-[28px] p-5 md:p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="section-kicker">{getStatusLabel(filter)}</p>
                      <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
                        {filter === "live"
                          ? "Ongoing Right Now"
                          : filter === "upcoming"
                            ? "Upcoming Queue"
                            : "Completed Results"}
                      </h2>
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                      {filteredTournaments.length} tournament
                      {filteredTournaments.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {filteredTournaments.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {filteredTournaments.map((tournament) => (
                        <article
                          key={tournament.id}
                          className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${getStatusTone(
                                    tournament.status
                                  )}`}
                                >
                                  {getStatusLabel(tournament.status)}
                                </span>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                                  {tournament.tier}
                                </span>
                              </div>

                              <h3 className="mt-4 font-display text-3xl uppercase leading-[0.9] text-white md:text-4xl">
                                {tournament.name}
                              </h3>
                            </div>

                            <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                              {tournamentStamp(tournament)}
                            </span>
                          </div>

                          {tournament.details ? (
                            <p className="mt-4 text-sm leading-7 text-text-secondary">
                              {tournament.details}
                            </p>
                          ) : null}

                          <div className="mt-5 grid gap-3 border-t border-white/8 pt-4 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                                Placement
                              </p>
                              <p className="mt-2 font-display text-2xl uppercase leading-none text-white md:text-4xl">
                                {tournament.placement ??
                                  (tournament.status === "completed" ? "—" : "TBD")}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                                Approx Prize
                              </p>
                              <p className="mt-2 font-display text-2xl uppercase leading-none text-white md:text-4xl">
                                {formatPrize(tournament.approxPrize)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(tournament)}
                              className="button-secondary px-4 text-xs"
                            >
                              {tournament.status === "completed" ? "Edit Completed" : "Edit Details"}
                            </button>
                            {tournament.status === "upcoming" ? (
                              <button
                                type="button"
                                onClick={() => void handleMoveToOngoing(tournament)}
                                disabled={statusActionId === tournament.id}
                                className="button-secondary px-4 text-xs"
                              >
                                {statusActionId === tournament.id ? "Moving..." : "Mark Ongoing"}
                              </button>
                            ) : null}
                            {tournament.status !== "completed" ? (
                              <button
                                type="button"
                                onClick={() => openCompleteModal(tournament)}
                                className="button-primary px-4 text-xs"
                              >
                                Mark Completed
                              </button>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-16 text-center text-sm text-text-muted">
                      No tournaments match the current status filter and search.
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {authorized && modalMode ? (
        <TournamentModal
          mode={modalMode}
          form={form}
          players={sortedPlayers}
          includeCompletionFields={
            modalMode === "complete" || activeTournament?.status === "completed"
          }
          saving={saving}
          onClose={resetModal}
          onSubmit={handleSubmit}
          onChange={updateForm}
        />
      ) : null}
    </>
  );
}
