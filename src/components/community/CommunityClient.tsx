"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FAN_REACTION_OPTIONS } from "@/lib/fanArena";
import type {
  CommunityBoard,
  CommunityLiveEvent,
  CommunityPost,
  CommunityPostReactionType,
  CommunityReactionKey,
  CommunityReactionSummary,
  CommunityUser,
  CommunityVote,
  CommunityVoteAggregate,
  FanProfileSummary,
  MediaMoment,
} from "@/data/types";

const SoulMomentPlayer = dynamic(() => import("@/components/moments/SoulMomentPlayer"), {
  ssr: false,
  loading: () => (
    <div className="grid aspect-video place-items-center rounded-[24px] border border-white/10 bg-black/30 text-xs uppercase tracking-[0.18em] text-text-muted">
      Loading moment
    </div>
  ),
});

type AuthMode = "login" | "signup";

function defaultAggregate(): CommunityVoteAggregate {
  return {
    totalVotes: 0,
    mvpVotesByPlayerId: {},
    iglVotesByPlayerId: {},
    winnerVotesByTeamId: {},
  };
}

function emptySummary(liveEventId: string): CommunityReactionSummary {
  return {
    liveEventId,
    total: 0,
    counts: {
      soul: 0,
      hype: 0,
      clutch: 0,
      respect: 0,
    },
  };
}

function formatDateLabel(value: string | null): string {
  return value ? value.slice(0, 10) : "Unscheduled";
}

export default function CommunityClient({
  user,
  board,
  posts,
  userVote,
  voteAggregate,
  liveEvents,
  reactionSummary,
  userReactions,
  fanProfile,
  moments,
}: {
  user: CommunityUser | null;
  board: CommunityBoard | null;
  posts: CommunityPost[];
  userVote: CommunityVote | null;
  voteAggregate: CommunityVoteAggregate | null;
  liveEvents: CommunityLiveEvent[];
  reactionSummary: Record<string, CommunityReactionSummary>;
  userReactions: Record<string, CommunityReactionKey[]>;
  fanProfile: FanProfileSummary | null;
  moments: MediaMoment[];
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

  const [postBody, setPostBody] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [postReactionLoading, setPostReactionLoading] = useState("");

  const [reactionState, setReactionState] = useState(reactionSummary);
  const [userReactionState, setUserReactionState] = useState(userReactions);
  const [liveReactionLoading, setLiveReactionLoading] = useState("");
  const [liveReactionError, setLiveReactionError] = useState("");
  const [badgeLoading, setBadgeLoading] = useState("");
  const [badgeError, setBadgeError] = useState("");

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

  const currentAggregate = voteAggregate ?? defaultAggregate();
  const badgeKeys = new Set((fanProfile?.badges ?? []).map((badge) => badge.badgeKey));
  const profileStats = {
    votes: fanProfile?.votesCount ?? (userVote ? 1 : 0),
    reactions: fanProfile?.reactionsCount ?? Object.values(userReactionState).flat().length,
    badges: fanProfile?.badgesCount ?? 0,
  };
  const heroMoment = moments[0] ?? null;

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

  async function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!postBody.trim()) return;

    setPostError("");
    setPostLoading(true);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: postBody }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Post could not be created.");
      }

      setPostBody("");
      router.refresh();
    } catch (error) {
      setPostError(error instanceof Error ? error.message : "Post could not be created.");
    } finally {
      setPostLoading(false);
    }
  }

  async function handlePostReaction(postId: string, reactionType: CommunityPostReactionType) {
    if (!user) {
      setPostError("Log in to react to fan posts.");
      return;
    }

    setPostReactionLoading(`${postId}:${reactionType}`);
    setPostError("");
    try {
      const response = await fetch(`/api/community/posts/${postId}/reaction`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reactionType }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Reaction failed.");
      }
      router.refresh();
    } catch (error) {
      setPostError(error instanceof Error ? error.message : "Reaction failed.");
    } finally {
      setPostReactionLoading("");
    }
  }

  async function handleLiveReaction(liveEventId: string, reactionKey: CommunityReactionKey) {
    if (!user) {
      setLiveReactionError("Log in to react to live pulses.");
      return;
    }

    setLiveReactionLoading(`${liveEventId}:${reactionKey}`);
    setLiveReactionError("");
    try {
      const response = await fetch("/api/community/reaction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ liveEventId, reactionKey }),
      });
      const data = (await response.json()) as { error?: string; summary?: CommunityReactionSummary };
      if (!response.ok || !data.summary) {
        throw new Error(data.error || "Reaction failed.");
      }

      setReactionState((current) => ({ ...current, [liveEventId]: data.summary as CommunityReactionSummary }));
      setUserReactionState((current) => {
        const next = new Set(current[liveEventId] ?? []);
        next.add(reactionKey);
        return { ...current, [liveEventId]: Array.from(next) };
      });
    } catch (error) {
      setLiveReactionError(error instanceof Error ? error.message : "Reaction failed.");
    } finally {
      setLiveReactionLoading("");
    }
  }

  async function handleBadgeClaim(badgeKey: string) {
    if (!user) return;

    setBadgeError("");
    setBadgeLoading(badgeKey);
    try {
      const response = await fetch("/api/community/badge-claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ badgeKey }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Badge could not be claimed.");
      }
      router.refresh();
    } catch (error) {
      setBadgeError(error instanceof Error ? error.message : "Badge could not be claimed.");
    } finally {
      setBadgeLoading("");
    }
  }

  return (
    <div className="fan-arena-shell space-y-6">
      <section className="fan-command-grid">
        <article className="fan-command-panel archive-panel public-card rounded-[32px] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">SOUL Arena OS</p>
              <h2 className="font-display text-4xl uppercase leading-[0.85] text-white md:text-7xl">
                Fan command center
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary">
                Track the featured board, publish your fan take, react to verified live pulses, and collect
                lightweight badges without leaving the Team SOUL archive.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {user ? (
                <>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-accent">
                    {user.username}
                  </span>
                  <button type="button" onClick={handleLogout} className="button-secondary">
                    Log out
                  </button>
                </>
              ) : (
                <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
                  Guest preview
                </span>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-4">
            <ArenaStat label="Board votes" value={currentAggregate.totalVotes.toString()} />
            <ArenaStat label="Live pulses" value={liveEvents.length.toString()} />
            <ArenaStat label="Fan posts" value={posts.length.toString()} />
            <ArenaStat label="Badges" value={profileStats.badges.toString()} />
          </div>
        </article>

        <aside className="archive-panel public-card rounded-[32px] p-6 md:p-8">
          <p className="section-kicker">Fan profile</p>
          {user ? (
            <>
              <h3 className="font-display text-3xl uppercase leading-none text-white">Your arena signal</h3>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <MiniStat label="Votes" value={profileStats.votes} />
                <MiniStat label="React" value={profileStats.reactions} />
                <MiniStat label="Badges" value={profileStats.badges} />
              </div>
              <div className="mt-5 space-y-2">
                {["fan_arena_founder", "first_vote_locked", "arena_pulse"].map((badgeKey) => (
                  <button
                    key={badgeKey}
                    type="button"
                    onClick={() => void handleBadgeClaim(badgeKey)}
                    disabled={badgeKeys.has(badgeKey) || badgeLoading === badgeKey}
                    className={`fan-badge-button ${
                      badgeKeys.has(badgeKey) ? "border-accent/30 bg-accent/10 text-accent" : ""
                    }`}
                  >
                    {badgeKey === "first_vote_locked"
                      ? "Vote Locked"
                      : badgeKey === "arena_pulse"
                        ? "Arena Pulse"
                        : "Arena Founder"}
                  </button>
                ))}
              </div>
              {badgeError ? <p className="mt-3 text-sm text-rose-300">{badgeError}</p> : null}
            </>
          ) : (
            <AuthForm
              authMode={authMode}
              setAuthMode={setAuthMode}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              authLoading={authLoading}
              authError={authError}
              onSubmit={handleAuthSubmit}
            />
          )}
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <LivePulsePanel
          liveEvents={liveEvents}
          reactionState={reactionState}
          userReactionState={userReactionState}
          loadingKey={liveReactionLoading}
          error={liveReactionError}
          onReact={handleLiveReaction}
        />

        <PredictionPanel
          user={user}
          board={board}
          userVote={userVote}
          candidateData={candidateData}
          currentAggregate={currentAggregate}
          voteLoading={voteLoading}
          voteError={voteError}
          mvpPlayerId={mvpPlayerId}
          bestIglPlayerId={bestIglPlayerId}
          winnerTeamId={winnerTeamId}
          setMvpPlayerId={setMvpPlayerId}
          setBestIglPlayerId={setBestIglPlayerId}
          setWinnerTeamId={setWinnerTeamId}
          onVoteSubmit={handleVoteSubmit}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <article className="archive-panel public-card rounded-[32px] p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Fan feed</p>
              <h3 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
                Match-day takes
              </h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
              {posts.length} posts
            </span>
          </div>

          {user ? (
            <form onSubmit={handlePostSubmit} className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <textarea
                value={postBody}
                onChange={(event) => setPostBody(event.target.value)}
                className="min-h-24 w-full resize-none rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-accent/40"
                placeholder="Drop a clean fan take for the arena..."
                maxLength={280}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-muted">{postBody.length}/280 characters</p>
                <button type="submit" disabled={postLoading} className="button-primary">
                  {postLoading ? "Publishing..." : "Publish Take"}
                </button>
              </div>
              {postError ? <p className="mt-3 text-sm text-rose-300">{postError}</p> : null}
            </form>
          ) : (
            <p className="mt-4 rounded-[20px] border border-white/10 bg-black/15 p-4 text-sm text-text-secondary">
              Sign in to publish posts or react. Guest mode can still read live pulses and board status.
            </p>
          )}

          <div className="mt-5 space-y-3">
            {posts.length ? (
              posts.map((post) => (
                <article key={post.id} className="rounded-[20px] border border-white/10 bg-black/15 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">@{post.authorUsername}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                      {formatDateLabel(post.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{post.body}</p>
                  <div className="mt-4 flex gap-2">
                    {(["like", "dislike"] as CommunityPostReactionType[]).map((reactionType) => (
                      <button
                        key={reactionType}
                        type="button"
                        onClick={() => void handlePostReaction(post.id, reactionType)}
                        disabled={postReactionLoading === `${post.id}:${reactionType}`}
                        className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
                          post.viewerReaction === reactionType
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-white/10 text-text-secondary hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {reactionType === "like" ? "Like" : "Pass"}{" "}
                        {reactionType === "like" ? post.likeCount : post.dislikeCount}
                      </button>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-text-muted">
                No fan posts yet. The first take will set the tone.
              </div>
            )}
          </div>
        </article>

        <article className="archive-panel public-card rounded-[32px] p-6 md:p-8">
          <p className="section-kicker">Soul moments</p>
          <h3 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
            Shareable reels
          </h3>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            Lightweight Remotion Player embeds for trophy reveals, roster intros, and match countdowns. Static cards stay readable while video loads.
          </p>

          <div className="mt-5">
            {heroMoment ? (
              <SoulMomentPlayer moment={heroMoment} />
            ) : (
              <div className="grid aspect-video place-items-center rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-accent">Moment engine ready</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Publish a moment from admin to light up this film rail.
                  </p>
                </div>
              </div>
            )}
          </div>

          {moments.length > 1 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {moments.slice(1).map((moment) => (
                <div key={moment.id} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">{moment.templateKey}</p>
                  <p className="mt-2 font-display text-xl uppercase leading-none text-white">{moment.title}</p>
                  {moment.description ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">{moment.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}

function ArenaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl uppercase leading-none text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 p-3 text-center">
      <p className="font-display text-2xl leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-text-muted">{label}</p>
    </div>
  );
}

function AuthForm({
  authMode,
  setAuthMode,
  username,
  setUsername,
  password,
  setPassword,
  authLoading,
  authError,
  onSubmit,
}: {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  authLoading: boolean;
  authError: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5 flex gap-2 rounded-full border border-white/10 bg-black/20 p-1">
        <button
          type="button"
          onClick={() => setAuthMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${
            authMode === "signup" ? "bg-white/10 text-white" : "text-text-secondary"
          }`}
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${
            authMode === "login" ? "bg-white/10 text-white" : "text-text-secondary"
          }`}
        >
          Login
        </button>
      </div>

      <label className="mb-4 block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/40"
          placeholder="soul_fan"
          required
        />
      </label>

      <label className="mb-5 block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/40"
          placeholder="At least 6 characters"
          required
        />
      </label>

      <button type="submit" disabled={authLoading} className="button-primary w-full">
        {authLoading ? "Please wait..." : authMode === "signup" ? "Create & Enter" : "Enter Arena"}
      </button>

      {authError ? <p className="mt-4 text-sm text-rose-300">{authError}</p> : null}
    </form>
  );
}

function LivePulsePanel({
  liveEvents,
  reactionState,
  userReactionState,
  loadingKey,
  error,
  onReact,
}: {
  liveEvents: CommunityLiveEvent[];
  reactionState: Record<string, CommunityReactionSummary>;
  userReactionState: Record<string, CommunityReactionKey[]>;
  loadingKey: string;
  error: string;
  onReact: (liveEventId: string, reactionKey: CommunityReactionKey) => void;
}) {
  return (
    <article className="archive-panel public-card route-live-panel rounded-[32px] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Live pulse rail</p>
          <h3 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
            Verified arena signals
          </h3>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-accent">
          {liveEvents.length ? "Live" : "Ready"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {liveEvents.length ? (
          liveEvents.map((event) => {
            const summary = reactionState[event.id] ?? emptySummary(event.id);
            const activeKeys = new Set(userReactionState[event.id] ?? []);
            return (
              <article key={event.id} className="fan-live-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-accent">
                    {event.eventType.replace("_", " ")}
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {event.isPinned ? "Pinned" : formatDateLabel(event.publishedAt)}
                  </span>
                </div>
                <h4 className="mt-2 font-display text-2xl uppercase leading-none text-white">{event.title}</h4>
                {event.body ? <p className="mt-3 text-sm leading-7 text-text-secondary">{event.body}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {FAN_REACTION_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onReact(event.id, option.key)}
                      disabled={loadingKey === `${event.id}:${option.key}`}
                      className={`fan-reaction-chip ${
                        activeKeys.has(option.key) ? "border-accent/40 bg-accent/10 text-accent" : ""
                      }`}
                    >
                      {option.shortLabel} {summary.counts[option.key] ?? 0}
                    </button>
                  ))}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-black/10 p-6 text-sm text-text-muted">
            No published live events yet. Admin can pin score updates, fan prompts, countdowns, or moment drops.
          </div>
        )}
      </div>
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
    </article>
  );
}

function PredictionPanel({
  user,
  board,
  userVote,
  candidateData,
  currentAggregate,
  voteLoading,
  voteError,
  mvpPlayerId,
  bestIglPlayerId,
  winnerTeamId,
  setMvpPlayerId,
  setBestIglPlayerId,
  setWinnerTeamId,
  onVoteSubmit,
}: {
  user: CommunityUser | null;
  board: CommunityBoard | null;
  userVote: CommunityVote | null;
  candidateData: {
    mvpCandidates: Array<{ id: string; label: string }>;
    iglCandidates: Array<{ id: string; label: string }>;
    teams: Array<{ id: string; label: string }>;
    playerNameById: Record<string, string>;
    teamNameById: Record<string, string>;
  };
  currentAggregate: CommunityVoteAggregate;
  voteLoading: boolean;
  voteError: string;
  mvpPlayerId: string;
  bestIglPlayerId: string;
  winnerTeamId: string;
  setMvpPlayerId: (value: string) => void;
  setBestIglPlayerId: (value: string) => void;
  setWinnerTeamId: (value: string) => void;
  onVoteSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!board) {
    return (
      <section className="archive-panel public-card route-info-panel rounded-[32px] p-6 md:p-8">
        <p className="section-kicker">Prediction board</p>
        <h3 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">No board live</h3>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          The team has not featured an open tournament board yet. Live pulses and posts can still run independently.
        </p>
      </section>
    );
  }

  return (
    <section className="archive-panel public-card rounded-[32px] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Featured prediction</p>
          <h3 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
            {board.tournamentName}
          </h3>
          {board.headline ? <p className="mt-3 text-sm uppercase tracking-[0.18em] text-accent">{board.headline}</p> : null}
          {board.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">{board.description}</p> : null}
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
          {currentAggregate.totalVotes} votes
        </span>
      </div>

      {userVote ? (
        <div className="mt-6">
          <p className="section-kicker">Vote submitted</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <LockedPick label="MVP" value={candidateData.playerNameById[userVote.mvpPlayerId] ?? "-"} />
            <LockedPick label="Best IGL" value={candidateData.playerNameById[userVote.bestIglPlayerId] ?? "-"} />
            <LockedPick label="Winner" value={candidateData.teamNameById[userVote.winnerTeamId] ?? "-"} />
          </div>
          <Leaderboard candidateData={candidateData} currentAggregate={currentAggregate} />
        </div>
      ) : (
        <form onSubmit={onVoteSubmit} className="mt-6">
          {!user ? (
            <p className="mb-4 rounded-[18px] border border-white/10 bg-black/15 p-4 text-sm text-text-secondary">
              Create an arena account to lock one final prediction. Preview stays open for everyone.
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            <VoteSelect
              label="MVP player"
              value={mvpPlayerId}
              onChange={setMvpPlayerId}
              placeholder="Select MVP"
              options={candidateData.mvpCandidates}
            />
            <VoteSelect
              label="Best IGL"
              value={bestIglPlayerId}
              onChange={setBestIglPlayerId}
              placeholder="Select IGL"
              options={candidateData.iglCandidates}
            />
            <VoteSelect
              label="Winner team"
              value={winnerTeamId}
              onChange={setWinnerTeamId}
              placeholder="Select team"
              options={candidateData.teams}
            />
          </div>
          <button type="submit" disabled={!user || voteLoading} className="button-primary mt-6">
            {voteLoading ? "Submitting..." : "Submit Vote"}
          </button>
          {voteError ? <p className="mt-4 text-sm text-rose-300">{voteError}</p> : null}
        </form>
      )}
    </section>
  );
}

function VoteSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none focus:border-accent/40"
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LockedPick({ label, value }: { label: string; value: string }) {
  return (
    <article className="route-card-chromatic rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 text-base text-white">{value}</p>
    </article>
  );
}

function Leaderboard({
  candidateData,
  currentAggregate,
}: {
  candidateData: {
    mvpCandidates: Array<{ id: string; label: string }>;
    iglCandidates: Array<{ id: string; label: string }>;
    teams: Array<{ id: string; label: string }>;
  };
  currentAggregate: CommunityVoteAggregate;
}) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <LeaderboardColumn title="MVP leaderboard" rows={candidateData.mvpCandidates} counts={currentAggregate.mvpVotesByPlayerId} />
      <LeaderboardColumn title="IGL leaderboard" rows={candidateData.iglCandidates} counts={currentAggregate.iglVotesByPlayerId} />
      <LeaderboardColumn title="Winner picks" rows={candidateData.teams} counts={currentAggregate.winnerVotesByTeamId} />
    </div>
  );
}

function LeaderboardColumn({
  title,
  rows,
  counts,
}: {
  title: string;
  rows: Array<{ id: string; label: string }>;
  counts: Record<string, number>;
}) {
  return (
    <article className="route-card-chromatic rounded-[20px] border border-white/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">{title}</p>
      <div className="mt-3 space-y-2 text-sm text-text-secondary">
        {rows.map((row) => (
          <p key={row.id} className="flex items-center justify-between gap-2">
            <span>{row.label}</span>
            <strong className="text-white">{counts[row.id] ?? 0}</strong>
          </p>
        ))}
      </div>
    </article>
  );
}
