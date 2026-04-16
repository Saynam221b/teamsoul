"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CommunityBoard,
  CommunityUser,
  CommunityVote,
  CommunityVoteAggregate,
} from "@/data/types";

type AuthMode = "login" | "signup";

export default function CommunityClient({
  user,
  board,
  userVote,
  voteAggregate,
}: {
  user: CommunityUser | null;
  board: CommunityBoard | null;
  userVote: CommunityVote | null;
  voteAggregate: CommunityVoteAggregate | null;
}) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [mvpPlayerId, setMvpPlayerId] = useState("");
  const [bestIglPlayerId, setBestIglPlayerId] = useState("");
  const [winnerTeamId, setWinnerTeamId] = useState("");
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState("");

  const candidateData = useMemo(() => {
    if (!board) {
      return {
        mvpCandidates: [],
        iglCandidates: [],
        teams: [],
        playerNameById: {} as Record<string, string>,
        teamNameById: {} as Record<string, string>,
      };
    }

    const mvpCandidates = board.teams.flatMap((team) =>
      team.players
        .filter((player) => player.isMvpCandidate)
        .map((player) => ({ id: player.id, label: `${player.displayName} (${team.shortName || team.name})` }))
    );

    const iglCandidates = board.teams.flatMap((team) =>
      team.players
        .filter((player) => player.isIglCandidate)
        .map((player) => ({ id: player.id, label: `${player.displayName} (${team.shortName || team.name})` }))
    );

    const playerNameById: Record<string, string> = {};
    const teamNameById: Record<string, string> = {};

    board.teams.forEach((team) => {
      teamNameById[team.id] = team.shortName || team.name;
      team.players.forEach((player) => {
        playerNameById[player.id] = player.displayName;
      });
    });

    return {
      mvpCandidates,
      iglCandidates,
      teams: board.teams.map((team) => ({ id: team.id, label: team.shortName || team.name })),
      playerNameById,
      teamNameById,
    };
  }, [board]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = authMode === "signup" ? "/api/community/auth/signup" : "/api/community/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Auth request failed.");
      }

      setUsername("");
      setPassword("");
      router.refresh();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Auth request failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthError("");
    setAuthLoading(true);
    try {
      await fetch("/api/community/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!board) return;

    setVoteError("");
    setVoteLoading(true);

    try {
      const response = await fetch("/api/community/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          boardId: board.id,
          mvpPlayerId,
          bestIglPlayerId,
          winnerTeamId,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not submit vote.");
      }

      router.refresh();
    } catch (error) {
      setVoteError(error instanceof Error ? error.message : "Could not submit vote.");
    } finally {
      setVoteLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="archive-panel rounded-[28px] p-6 md:p-8">
          <p className="section-kicker">Community access</p>
          <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
            Vote Like A Team SOUL Insider
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            Create a simple account and lock your one-shot picks for MVP, Best IGL, and the match winner.
          </p>
        </article>

        <form onSubmit={handleAuthSubmit} className="archive-panel rounded-[28px] p-6 md:p-8">
          <div className="mb-6 flex gap-2 rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                authMode === "signup" ? "bg-white/10 text-white" : "text-text-secondary"
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                authMode === "login" ? "bg-white/10 text-white" : "text-text-secondary"
              }`}
            >
              Log in
            </button>
          </div>

          <label className="mb-4 block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
              placeholder="soul_fan"
              required
            />
          </label>

          <label className="mb-6 block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
              placeholder="At least 6 characters"
              required
            />
          </label>

          <button type="submit" disabled={authLoading} className="button-primary w-full">
            {authLoading ? "Please wait..." : authMode === "signup" ? "Create & Enter" : "Enter Community"}
          </button>

          {authError ? <p className="mt-4 text-sm text-rose-300">{authError}</p> : null}
        </form>
      </div>
    );
  }

  if (!board) {
    return (
      <section className="archive-panel rounded-[28px] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Welcome, {user.username}</p>
            <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
              Voting Is Not Open Yet
            </h2>
          </div>
          <button type="button" onClick={handleLogout} className="button-secondary">
            Log out
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          The admin team has not opened a featured live tournament board yet. Check back once voting begins.
        </p>
      </section>
    );
  }

  const currentAggregate = voteAggregate ?? {
    totalVotes: 0,
    mvpVotesByPlayerId: {},
    iglVotesByPlayerId: {},
    winnerVotesByTeamId: {},
  };

  return (
    <div className="space-y-6">
      <section className="archive-panel rounded-[28px] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Featured ongoing tournament</p>
            <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
              {board.tournamentName}
            </h2>
            {board.headline ? <p className="mt-3 text-sm uppercase tracking-[0.18em] text-accent">{board.headline}</p> : null}
            {board.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">{board.description}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
              {currentAggregate.totalVotes} votes
            </span>
            <button type="button" onClick={handleLogout} className="button-secondary">
              Log out
            </button>
          </div>
        </div>
      </section>

      {userVote ? (
        <section className="archive-panel rounded-[28px] p-6 md:p-8">
          <p className="section-kicker">Vote submitted</p>
          <h3 className="font-display text-2xl uppercase leading-none text-white md:text-4xl">Your Picks Are Locked</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">MVP</p>
              <p className="mt-2 text-base text-white">{candidateData.playerNameById[userVote.mvpPlayerId] ?? "-"}</p>
            </article>
            <article className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">Best IGL</p>
              <p className="mt-2 text-base text-white">{candidateData.playerNameById[userVote.bestIglPlayerId] ?? "-"}</p>
            </article>
            <article className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">Winner</p>
              <p className="mt-2 text-base text-white">{candidateData.teamNameById[userVote.winnerTeamId] ?? "-"}</p>
            </article>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-[20px] border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">MVP leaderboard</p>
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                {candidateData.mvpCandidates.map((candidate) => (
                  <p key={candidate.id} className="flex items-center justify-between gap-2">
                    <span>{candidate.label}</span>
                    <strong className="text-white">{currentAggregate.mvpVotesByPlayerId[candidate.id] ?? 0}</strong>
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-[20px] border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">IGL leaderboard</p>
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                {candidateData.iglCandidates.map((candidate) => (
                  <p key={candidate.id} className="flex items-center justify-between gap-2">
                    <span>{candidate.label}</span>
                    <strong className="text-white">{currentAggregate.iglVotesByPlayerId[candidate.id] ?? 0}</strong>
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-[20px] border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">Winner picks</p>
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                {candidateData.teams.map((team) => (
                  <p key={team.id} className="flex items-center justify-between gap-2">
                    <span>{team.label}</span>
                    <strong className="text-white">{currentAggregate.winnerVotesByTeamId[team.id] ?? 0}</strong>
                  </p>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : (
        <form onSubmit={handleVoteSubmit} className="archive-panel rounded-[28px] p-6 md:p-8">
          <p className="section-kicker">One vote per account</p>
          <h3 className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
            Lock Your Tournament Predictions
          </h3>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">MVP player</span>
              <select
                value={mvpPlayerId}
                onChange={(event) => setMvpPlayerId(event.target.value)}
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
                required
              >
                <option value="">Select MVP</option>
                {candidateData.mvpCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Best IGL</span>
              <select
                value={bestIglPlayerId}
                onChange={(event) => setBestIglPlayerId(event.target.value)}
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
                required
              >
                <option value="">Select IGL</option>
                {candidateData.iglCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Winner team</span>
              <select
                value={winnerTeamId}
                onChange={(event) => setWinnerTeamId(event.target.value)}
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white"
                required
              >
                <option value="">Select team</option>
                {candidateData.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" disabled={voteLoading} className="button-primary mt-6">
            {voteLoading ? "Submitting..." : "Submit Vote"}
          </button>

          {voteError ? <p className="mt-4 text-sm text-rose-300">{voteError}</p> : null}
        </form>
      )}
    </div>
  );
}
