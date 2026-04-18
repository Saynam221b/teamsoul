"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminCommunityBoard,
  CommunityBoardTeamEditorInput,
  CommunityVotingState,
  CreateCommunityBoardInput,
  UpdateCommunityBoardInput,
} from "@/data/types";

type LiveTournamentOption = { id: string; name: string };

type TeamPlayerInput = CommunityBoardTeamEditorInput["players"][number];

function emptyTeam(sortOrder: number): CommunityBoardTeamEditorInput {
  return {
    name: "",
    shortName: "",
    sortOrder,
    players: [],
  };
}

function inferIglFromRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return /\bigl\b/i.test(role);
}

function parsePlayerNameList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function teamKey(team: CommunityBoardTeamEditorInput, teamIndex: number): string {
  return team.id ?? `team-${teamIndex}`;
}

function normalizeTeamsForSave(teams: CommunityBoardTeamEditorInput[]): CommunityBoardTeamEditorInput[] {
  return teams
    .map((team, teamIndex) => {
      const normalizedPlayers = team.players.reduce<TeamPlayerInput[]>((acc, player, playerIndex) => {
          const displayName = player.displayName.trim();
          const role = player.role?.trim() || null;
          if (!displayName) return acc;

          acc.push({
            ...player,
            displayName,
            role,
            sortOrder: playerIndex,
            isMvpCandidate: player.isMvpCandidate ?? true,
            isIglCandidate:
              player.isIglCandidate === undefined
                ? inferIglFromRole(role)
                : Boolean(player.isIglCandidate),
          } satisfies TeamPlayerInput);

          return acc;
        }, []);

      return {
        ...team,
        name: team.name.trim(),
        shortName: team.shortName?.trim() || null,
        sortOrder: teamIndex,
        players: normalizedPlayers,
      } satisfies CommunityBoardTeamEditorInput;
    })
    .filter((team) => team.name.length > 0);
}

export default function AdminCommunitySection({
  authHeaders,
}: {
  authHeaders: Record<string, string>;
}) {
  const [boards, setBoards] = useState<AdminCommunityBoard[]>([]);
  const [liveTournaments, setLiveTournaments] = useState<LiveTournamentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [createTournamentId, setCreateTournamentId] = useState("");

  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const activeBoard = useMemo(
    () => boards.find((item) => item.id === activeBoardId) ?? null,
    [boards, activeBoardId]
  );

  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [votingState, setVotingState] = useState<CommunityVotingState>("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [teams, setTeams] = useState<CommunityBoardTeamEditorInput[]>([]);
  const [quickPlayersByTeam, setQuickPlayersByTeam] = useState<Record<string, string>>({});

  const loadBoards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/community/boards", { headers: authHeaders });
      const data = (await response.json()) as {
        boards?: AdminCommunityBoard[];
        liveTournaments?: LiveTournamentOption[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not load community boards.");
      }

      const boardList = data.boards ?? [];
      setBoards(boardList);
      setLiveTournaments(data.liveTournaments ?? []);

      if (boardList.length > 0) {
        const targetId =
          boardList.some((item) => item.id === activeBoardId) && activeBoardId
            ? activeBoardId
            : boardList[0].id;
        setActiveBoardId(targetId);
      } else {
        setActiveBoardId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load community boards.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, activeBoardId]);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    if (!activeBoard) {
      setHeadline("");
      setDescription("");
      setVotingState("draft");
      setIsFeatured(false);
      setTeams([]);
      setQuickPlayersByTeam({});
      return;
    }

    setHeadline(activeBoard.headline ?? "");
    setDescription(activeBoard.description ?? "");
    setVotingState(activeBoard.votingState);
    setIsFeatured(activeBoard.isFeatured);
    setTeams(
      activeBoard.teams.map((team) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        sortOrder: team.sortOrder,
        players: team.players.map((player) => ({
          id: player.id,
          displayName: player.displayName,
          role: player.role,
          isMvpCandidate: player.isMvpCandidate,
          isIglCandidate: player.isIglCandidate,
          sortOrder: player.sortOrder,
        })),
      }))
    );
    setQuickPlayersByTeam({});
  }, [activeBoard]);

  async function handleCreateBoard() {
    if (!createTournamentId) {
      setError("Select a live tournament before creating a board.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload: CreateCommunityBoardInput = {
        tournamentId: createTournamentId,
        votingState: "draft",
        isFeatured: false,
      };

      const response = await fetch("/api/admin/community/boards", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { board?: AdminCommunityBoard; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not create board.");
      }

      setCreateTournamentId("");
      setNotice("Community board created. Team SouL active roster is preloaded.");
      await loadBoards();
      if (data.board?.id) {
        setActiveBoardId(data.board.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create board.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveBoard() {
    if (!activeBoardId) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload: UpdateCommunityBoardInput = {
        headline: headline.trim() || null,
        description: description.trim() || null,
        votingState,
        isFeatured,
        teams: normalizeTeamsForSave(teams),
      };

      const response = await fetch(`/api/admin/community/boards/${activeBoardId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { board?: AdminCommunityBoard; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not save board.");
      }

      setNotice("Community board updated.");
      await loadBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save board.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBoard() {
    if (!activeBoardId) return;
    if (!window.confirm("Delete this community board? This action cannot be undone.")) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/community/boards/${activeBoardId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not delete board.");
      }

      setNotice("Community board deleted.");
      await loadBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete board.");
    } finally {
      setSaving(false);
    }
  }

  function addTeam() {
    setTeams((current) => [...current, emptyTeam(current.length)]);
  }

  function updateTeam(index: number, update: Partial<CommunityBoardTeamEditorInput>) {
    setTeams((current) => current.map((team, idx) => (idx === index ? { ...team, ...update } : team)));
  }

  function removeTeam(index: number) {
    setTeams((current) => current.filter((_, idx) => idx !== index));
  }

  function addPlayer(teamIndex: number, initial?: Partial<TeamPlayerInput>) {
    setTeams((current) =>
      current.map((team, idx) => {
        if (idx !== teamIndex) return team;
        const role = initial?.role?.trim() || "";
        return {
          ...team,
          players: [
            ...team.players,
            {
              displayName: initial?.displayName ?? "",
              role,
              isMvpCandidate: initial?.isMvpCandidate ?? true,
              isIglCandidate: initial?.isIglCandidate ?? inferIglFromRole(role),
              sortOrder: team.players.length,
            },
          ],
        };
      })
    );
  }

  function updatePlayer(
    teamIndex: number,
    playerIndex: number,
    update: Partial<CommunityBoardTeamEditorInput["players"][number]>
  ) {
    setTeams((current) =>
      current.map((team, idx) => {
        if (idx !== teamIndex) return team;
        return {
          ...team,
          players: team.players.map((player, pIdx) =>
            pIdx === playerIndex ? { ...player, ...update } : player
          ),
        };
      })
    );
  }

  function removePlayer(teamIndex: number, playerIndex: number) {
    setTeams((current) =>
      current.map((team, idx) => {
        if (idx !== teamIndex) return team;
        return {
          ...team,
          players: team.players.filter((_, pIdx) => pIdx !== playerIndex),
        };
      })
    );
  }

  function updateQuickPlayers(teamIndex: number, value: string) {
    const key = teamKey(teams[teamIndex], teamIndex);
    setQuickPlayersByTeam((current) => ({ ...current, [key]: value }));
  }

  function addQuickPlayers(teamIndex: number) {
    const key = teamKey(teams[teamIndex], teamIndex);
    const raw = quickPlayersByTeam[key] ?? "";
    const names = parsePlayerNameList(raw);
    if (!names.length) return;

    for (const name of names) {
      addPlayer(teamIndex, { displayName: name });
    }

    setQuickPlayersByTeam((current) => ({ ...current, [key]: "" }));
  }

  return (
    <section className="space-y-5">
      <div className="archive-panel rounded-[28px] p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Community control</p>
            <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
              Voting Boards
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
              Simple flow: create a board for a live tournament, get Team SouL players prefilled by default,
              then add opponent teams and publish when ready.
            </p>
          </div>
          <button type="button" className="button-secondary" onClick={() => void loadBoards()}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-3 md:grid-cols-1">
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Live tournament</span>
              <select
                value={createTournamentId}
                onChange={(event) => setCreateTournamentId(event.target.value)}
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
              >
                <option value="">Select ongoing tournament</option>
                {liveTournaments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-text-muted">
              New boards start in draft mode and auto-add Team SouL active roster players.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleCreateBoard()}
            disabled={saving}
            className="button-primary self-end"
          >
            {saving ? "Working..." : "Create Board"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="archive-panel rounded-[20px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="archive-panel rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <aside className="archive-panel rounded-[28px] p-5 md:p-6">
          <p className="section-kicker">Boards</p>
          <p className="mt-2 text-xs text-text-muted">Select a board to edit details, teams, and players.</p>
          <div className="mt-4 space-y-3">
            {boards.length ? (
              boards.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => setActiveBoardId(board.id)}
                  className={`w-full rounded-[18px] border p-4 text-left transition-colors ${
                    board.id === activeBoardId
                      ? "border-accent/30 bg-accent/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    {board.tournamentStatus} {board.isFeatured ? "• featured" : ""}
                  </p>
                  <p className="mt-2 font-display text-xl uppercase leading-none text-white">
                    {board.tournamentName}
                  </p>
                  <p className="mt-2 text-xs text-text-secondary">
                    {board.voteAggregate.totalVotes} votes • {board.votingState}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-text-muted">
                No community boards yet.
              </div>
            )}
          </div>
        </aside>

        <section className="archive-panel rounded-[28px] p-5 md:p-6">
          {activeBoard ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="section-kicker">Board editor</p>
                  <h3 className="font-display text-3xl uppercase leading-none text-white md:text-4xl">
                    {activeBoard.tournamentName}
                  </h3>
                  <p className="mt-2 text-xs text-text-muted">
                    Tab 1: set headline/description. Tab 2: add teams and players. Tab 3: set status to open and feature when live.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveBoard()}
                    className="button-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Board"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteBoard()}
                    className="button-secondary"
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-1">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Headline</span>
                  <input
                    value={headline}
                    onChange={(event) => setHeadline(event.target.value)}
                    className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
                    placeholder="Example: Grand Finals Community Vote"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Description</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-24 w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
                    placeholder="Tell users what they are voting for, and any rules."
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Voting state</span>
                  <select
                    value={votingState}
                    onChange={(event) => setVotingState(event.target.value as CommunityVotingState)}
                    className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
                  >
                    <option value="draft">Draft (editing only)</option>
                    <option value="open">Open (users can vote)</option>
                    <option value="locked">Locked (voting closed)</option>
                  </select>
                </label>

                <label className="mt-7 inline-flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) => setIsFeatured(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/20"
                  />
                  Featured board (shows publicly when tournament is live)
                </label>
              </div>

              <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Votes</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Total: <strong className="text-white">{activeBoard.voteAggregate.totalVotes}</strong>
                </p>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Teams & players</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Team SouL is preloaded by default. Add opponent teams and their players here.
                    </p>
                  </div>
                  <button type="button" className="button-secondary" onClick={addTeam}>
                    Add Team
                  </button>
                </div>

                <div className="space-y-4">
                  {teams.map((team, teamIndex) => {
                    const key = teamKey(team, teamIndex);
                    return (
                      <div
                        key={team.id ?? `team-${teamIndex}`}
                        className="rounded-[18px] border border-white/10 bg-black/15 p-4"
                      >
                        <div className="grid gap-3 md:grid-cols-[1fr_0.5fr_auto]">
                          <input
                            value={team.name}
                            onChange={(event) => updateTeam(teamIndex, { name: event.target.value })}
                            className="rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                            placeholder="Team name"
                          />
                          <input
                            value={team.shortName ?? ""}
                            onChange={(event) => updateTeam(teamIndex, { shortName: event.target.value })}
                            className="rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                            placeholder="Short"
                          />
                          <button type="button" className="button-secondary" onClick={() => removeTeam(teamIndex)}>
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                          <input
                            value={quickPlayersByTeam[key] ?? ""}
                            onChange={(event) => updateQuickPlayers(teamIndex, event.target.value)}
                            className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                            placeholder="Quick add players (comma or new line separated)"
                          />
                          <button
                            type="button"
                            onClick={() => addQuickPlayers(teamIndex)}
                            className="button-secondary"
                          >
                            Add List
                          </button>
                        </div>

                        <div className="mt-3 space-y-2">
                          {team.players.map((player, playerIndex) => (
                            <div
                              key={player.id ?? `player-${playerIndex}`}
                              className="grid gap-2 md:grid-cols-[1fr_0.7fr_auto_auto_auto]"
                            >
                              <input
                                value={player.displayName}
                                onChange={(event) =>
                                  updatePlayer(teamIndex, playerIndex, { displayName: event.target.value })
                                }
                                className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                                placeholder="Player"
                              />
                              <input
                                value={player.role ?? ""}
                                onChange={(event) => {
                                  const role = event.target.value;
                                  updatePlayer(teamIndex, playerIndex, {
                                    role,
                                    isIglCandidate: inferIglFromRole(role)
                                      ? true
                                      : Boolean(player.isIglCandidate),
                                  });
                                }}
                                className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                                placeholder="Role"
                              />
                              <label className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                <input
                                  type="checkbox"
                                  checked={Boolean(player.isMvpCandidate)}
                                  onChange={(event) =>
                                    updatePlayer(teamIndex, playerIndex, {
                                      isMvpCandidate: event.target.checked,
                                    })
                                  }
                                />
                                MVP
                              </label>
                              <label className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                <input
                                  type="checkbox"
                                  checked={Boolean(player.isIglCandidate)}
                                  onChange={(event) =>
                                    updatePlayer(teamIndex, playerIndex, {
                                      isIglCandidate: event.target.checked,
                                    })
                                  }
                                />
                                IGL
                              </label>
                              <button
                                type="button"
                                className="rounded-full border border-red-500/20 px-2 py-1 text-xs text-red-300"
                                onClick={() => removePlayer(teamIndex, playerIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => addPlayer(teamIndex)}
                          className="button-secondary mt-3"
                        >
                          Add Player
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[20px] border border-dashed border-white/10 bg-black/10 p-8 text-sm text-text-muted">
              Select a board to edit details, teams, players, vote settings, and featured status.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
