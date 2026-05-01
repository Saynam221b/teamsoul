import { randomUUID } from "node:crypto";
import type {
  AdminCommunityBoard,
  CommunityBadge,
  CommunityBadgeClaimPayload,
  CommunityBoard,
  CommunityBoardPlayer,
  CommunityBoardTeam,
  CommunityLiveEvent,
  CommunityLiveEventType,
  CommunityPost,
  CommunityPostReactionType,
  CommunityReaction,
  CommunityReactionKey,
  CommunityReactionPayload,
  CommunityReactionSummary,
  CommunitySession,
  CommunityUser,
  CommunityVote,
  CommunityVoteAggregate,
  CommunityVotePayload,
  CreateCommunityBoardInput,
  CreateCommunityLiveEventInput,
  CreateMediaMomentInput,
  FanContentStatus,
  FanEngagementRollup,
  FanProfileSummary,
  MediaMoment,
  MediaMomentTemplateKey,
  UpdateCommunityBoardInput,
  UpdateCommunityLiveEventInput,
  UpdateMediaMomentInput,
} from "@/data/types";
import {
  badgeCopyForKey,
  buildReactionSummary,
  canClaimBadge,
  isCommunityReactionKey,
  normalizeFanContentStatus,
  normalizeMomentTemplate,
} from "@/lib/fanArena";
import {
  isCommunityPostReactionType,
  normalizeCommunityPostBody,
  validateCommunityPostBody,
} from "@/lib/communityPosts";
import { getPostgresPool, isPostgresConfigured } from "@/lib/postgres";

type DbCommunityUserRow = {
  id: string;
  username: string;
  username_normalized: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
};

type DbCommunitySessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
};

type DbBoardRow = {
  id: string;
  tournament_id: string;
  tournament_name: string;
  tournament_status: "completed" | "upcoming" | "live";
  headline: string | null;
  description: string | null;
  is_featured: boolean;
  voting_state: "draft" | "open" | "locked";
  created_at: string;
  updated_at: string;
};

type DbTeamRow = {
  id: string;
  board_id: string;
  name: string;
  short_name: string | null;
  sort_order: number;
};

type DbPlayerRow = {
  id: string;
  team_id: string;
  display_name: string;
  role: string | null;
  is_mvp_candidate: boolean;
  is_igl_candidate: boolean;
  sort_order: number;
};

type DbRosterPlayerRow = {
  id: string;
  display_name: string;
  role: string | null;
};

type DbVoteRow = {
  id: string;
  board_id: string;
  user_id: string;
  mvp_player_id: string;
  best_igl_player_id: string;
  winner_team_id: string;
  created_at: string;
};

type DbCommunityPostRow = {
  id: string;
  author_user_id: string;
  author_username: string;
  body: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  dislike_count: number;
  viewer_reaction: CommunityPostReactionType | null;
};

type DbCommunityLiveEventRow = {
  id: string;
  board_id: string | null;
  tournament_id: string | null;
  tournament_name: string | null;
  event_type: CommunityLiveEventType;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  status: FanContentStatus;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbCommunityReactionRow = {
  id: string;
  live_event_id: string;
  user_id: string;
  reaction_key: CommunityReactionKey;
  created_at: string;
};

type DbCommunityBadgeRow = {
  id: string;
  user_id: string;
  badge_key: string;
  label: string;
  description: string;
  source: string | null;
  earned_at: string;
};

type DbMediaMomentRow = {
  id: string;
  tournament_id: string | null;
  tournament_name: string | null;
  title: string;
  description: string | null;
  template_key: MediaMomentTemplateKey;
  status: FanContentStatus;
  duration_seconds: number;
  accent: "cyan" | "gold" | "energy";
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbFanEngagementRollupRow = {
  id: string;
  rollup_date: string;
  board_id: string | null;
  board_headline: string | null;
  votes_count: number;
  reactions_count: number;
  active_users_count: number;
  badges_awarded_count: number;
  created_at: string;
};

function ensurePool() {
  if (!isPostgresConfigured()) {
    throw new Error("Postgres is not configured.");
  }

  const pool = getPostgresPool();
  if (!pool) {
    throw new Error("Postgres client unavailable.");
  }

  return pool;
}

function makeId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function isIglRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return /\bigl\b/i.test(role);
}

function mapCommunityUser(row: Pick<DbCommunityUserRow, "id" | "username" | "created_at">): CommunityUser {
  return {
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
  };
}

function mapCommunitySession(row: DbCommunitySessionRow): CommunitySession {
  return {
    id: row.id,
    userId: row.user_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
  };
}

function mapPlayer(row: DbPlayerRow): CommunityBoardPlayer {
  return {
    id: row.id,
    teamId: row.team_id,
    displayName: row.display_name,
    role: row.role,
    isMvpCandidate: row.is_mvp_candidate,
    isIglCandidate: row.is_igl_candidate,
    sortOrder: row.sort_order,
  };
}

function mapTeam(row: DbTeamRow, players: CommunityBoardPlayer[]): CommunityBoardTeam {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    shortName: row.short_name,
    sortOrder: row.sort_order,
    players,
  };
}

function mapBoard(row: DbBoardRow, teams: CommunityBoardTeam[]): CommunityBoard {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    tournamentStatus: row.tournament_status,
    headline: row.headline,
    description: row.description,
    isFeatured: row.is_featured,
    votingState: row.voting_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    teams,
  };
}

function mapVote(row: DbVoteRow): CommunityVote {
  return {
    id: row.id,
    boardId: row.board_id,
    userId: row.user_id,
    mvpPlayerId: row.mvp_player_id,
    bestIglPlayerId: row.best_igl_player_id,
    winnerTeamId: row.winner_team_id,
    createdAt: row.created_at,
  };
}

function mapCommunityPost(row: DbCommunityPostRow): CommunityPost {
  return {
    id: row.id,
    authorUserId: row.author_user_id,
    authorUsername: row.author_username,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    likeCount: row.like_count,
    dislikeCount: row.dislike_count,
    viewerReaction: row.viewer_reaction,
  };
}

async function getCommunityPostById(postId: string, viewerUserId: string | null): Promise<CommunityPost | null> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      with reaction_totals as (
        select
          post_id,
          count(*) filter (where reaction_type = 'like')::int as like_count,
          count(*) filter (where reaction_type = 'dislike')::int as dislike_count
        from public.community_post_reactions
        group by post_id
      ),
      viewer_reactions as (
        select post_id, reaction_type
        from public.community_post_reactions
        where $2::text is not null and user_id = $2
      )
      select
        p.id,
        p.author_user_id,
        u.username as author_username,
        p.body,
        p.created_at::text as created_at,
        p.updated_at::text as updated_at,
        coalesce(rt.like_count, 0) as like_count,
        coalesce(rt.dislike_count, 0) as dislike_count,
        vr.reaction_type as viewer_reaction
      from public.community_posts p
      join public.community_users u on u.id = p.author_user_id
      left join reaction_totals rt on rt.post_id = p.id
      left join viewer_reactions vr on vr.post_id = p.id
      where p.id = $1
      limit 1
    `,
    [postId, viewerUserId]
  );

  const rows = result.rows as DbCommunityPostRow[];
  return rows[0] ? mapCommunityPost(rows[0]) : null;
}

function mapLiveEvent(row: DbCommunityLiveEventRow): CommunityLiveEvent {
  return {
    id: row.id,
    boardId: row.board_id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    eventType: row.event_type,
    title: row.title,
    body: row.body,
    payload: row.payload ?? {},
    status: row.status,
    isPinned: row.is_pinned,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReaction(row: DbCommunityReactionRow): CommunityReaction {
  return {
    id: row.id,
    liveEventId: row.live_event_id,
    userId: row.user_id,
    reactionKey: row.reaction_key,
    createdAt: row.created_at,
  };
}

function mapBadge(row: DbCommunityBadgeRow): CommunityBadge {
  return {
    id: row.id,
    userId: row.user_id,
    badgeKey: row.badge_key,
    label: row.label,
    description: row.description,
    source: row.source,
    earnedAt: row.earned_at,
  };
}

function mapMediaMoment(row: DbMediaMomentRow): MediaMoment {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    title: row.title,
    description: row.description,
    templateKey: row.template_key,
    status: row.status,
    durationSeconds: row.duration_seconds,
    accent: row.accent,
    thumbnailUrl: row.thumbnail_url,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFanEngagementRollup(row: DbFanEngagementRollupRow): FanEngagementRollup {
  return {
    id: row.id,
    rollupDate: row.rollup_date,
    boardId: row.board_id,
    boardHeadline: row.board_headline,
    votesCount: row.votes_count,
    reactionsCount: row.reactions_count,
    activeUsersCount: row.active_users_count,
    badgesAwardedCount: row.badges_awarded_count,
    createdAt: row.created_at,
  };
}

export async function findCommunityUserByNormalizedUsername(
  usernameNormalized: string
): Promise<(CommunityUser & { passwordHash: string; passwordSalt: string; usernameNormalized: string }) | null> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select id, username, username_normalized, password_hash, password_salt, created_at::text as created_at
      from public.community_users
      where username_normalized = $1
      limit 1
    `,
    [usernameNormalized]
  );

  const rows = result.rows as DbCommunityUserRow[];
  const row = rows[0];
  if (!row) return null;

  return {
    ...mapCommunityUser(row),
    usernameNormalized: row.username_normalized,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
  };
}

export async function createCommunityUser(input: {
  username: string;
  usernameNormalized: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<CommunityUser> {
  const pool = ensurePool();

  try {
    const result = await pool.query(
      `
        insert into public.community_users (id, username, username_normalized, password_hash, password_salt)
        values ($1, $2, $3, $4, $5)
        returning id, username, created_at::text as created_at
      `,
      [makeId("community_user"), input.username.trim(), input.usernameNormalized, input.passwordHash, input.passwordSalt]
    );

    const rows = result.rows as Array<Pick<DbCommunityUserRow, "id" | "username" | "created_at">>;
    return mapCommunityUser(rows[0]);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new Error("Username is already taken.");
    }
    throw error;
  }
}

export async function createCommunitySession(input: {
  userId: string;
  tokenHash: string;
  expiresAtIso: string;
}): Promise<CommunitySession> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      insert into public.community_sessions (id, user_id, token_hash, expires_at)
      values ($1, $2, $3, $4::timestamptz)
      returning
        id,
        user_id,
        token_hash,
        expires_at::text as expires_at,
        created_at::text as created_at,
        last_seen_at::text as last_seen_at
    `,
    [makeId("community_session"), input.userId, input.tokenHash, input.expiresAtIso]
  );

  const rows = result.rows as DbCommunitySessionRow[];
  return mapCommunitySession(rows[0]);
}

export async function findCommunitySessionByTokenHash(tokenHash: string): Promise<{
  session: CommunitySession;
  user: CommunityUser;
} | null> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        s.id,
        s.user_id,
        s.token_hash,
        s.expires_at::text as expires_at,
        s.created_at::text as created_at,
        s.last_seen_at::text as last_seen_at,
        u.username,
        u.created_at::text as user_created_at
      from public.community_sessions s
      join public.community_users u on u.id = s.user_id
      where s.token_hash = $1
      limit 1
    `,
    [tokenHash]
  );

  const rows = result.rows as Array<DbCommunitySessionRow & { username: string; user_created_at: string }>;
  const row = rows[0];
  if (!row) return null;

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await deleteCommunitySessionByTokenHash(tokenHash);
    return null;
  }

  return {
    session: mapCommunitySession(row),
    user: {
      id: row.user_id,
      username: row.username,
      createdAt: row.user_created_at,
    },
  };
}

export async function touchCommunitySession(sessionId: string): Promise<void> {
  const pool = ensurePool();
  await pool.query(`update public.community_sessions set last_seen_at = now() where id = $1`, [sessionId]);
}

export async function deleteCommunitySessionByTokenHash(tokenHash: string): Promise<void> {
  const pool = ensurePool();
  await pool.query(`delete from public.community_sessions where token_hash = $1`, [tokenHash]);
}

async function loadBoardTeamsAndPlayers(boardId: string): Promise<CommunityBoardTeam[]> {
  const pool = ensurePool();

  const result = await pool.query(
    `
      select
        t.id as team_id,
        t.board_id,
        t.name,
        t.short_name,
        t.sort_order as team_sort_order,
        p.id as player_id,
        p.display_name,
        p.role,
        p.is_mvp_candidate,
        p.is_igl_candidate,
        p.sort_order as player_sort_order
      from public.community_board_teams t
      left join public.community_board_players p on p.team_id = t.id
      where t.board_id = $1
      order by t.sort_order asc, t.name asc, p.sort_order asc nulls last, p.display_name asc nulls last
    `,
    [boardId]
  );

  const teamsById = new Map<string, { team: DbTeamRow; players: CommunityBoardPlayer[] }>();
  for (const row of result.rows as Array<{
    team_id: string;
    board_id: string;
    name: string;
    short_name: string | null;
    team_sort_order: number;
    player_id: string | null;
    display_name: string | null;
    role: string | null;
    is_mvp_candidate: boolean | null;
    is_igl_candidate: boolean | null;
    player_sort_order: number | null;
  }>) {
    const existing =
      teamsById.get(row.team_id) ??
      {
        team: {
          id: row.team_id,
          board_id: row.board_id,
          name: row.name,
          short_name: row.short_name,
          sort_order: row.team_sort_order,
        },
        players: [],
      };

    if (row.player_id && row.display_name) {
      existing.players.push(
        mapPlayer({
          id: row.player_id,
          team_id: row.team_id,
          display_name: row.display_name,
          role: row.role,
          is_mvp_candidate: Boolean(row.is_mvp_candidate),
          is_igl_candidate: Boolean(row.is_igl_candidate),
          sort_order: row.player_sort_order ?? 0,
        })
      );
    }

    teamsById.set(row.team_id, existing);
  }

  return Array.from(teamsById.values()).map(({ team, players }) => mapTeam(team, players));
}

export async function getCommunityVoteAggregate(boardId: string): Promise<CommunityVoteAggregate> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      with board_votes as (
        select mvp_player_id, best_igl_player_id, winner_team_id
        from public.community_board_votes
        where board_id = $1
      ),
      mvp_votes as (
        select coalesce(jsonb_object_agg(id, total), '{}'::jsonb) as data
        from (
          select mvp_player_id as id, count(*)::int as total
          from board_votes
          group by mvp_player_id
        ) grouped
      ),
      igl_votes as (
        select coalesce(jsonb_object_agg(id, total), '{}'::jsonb) as data
        from (
          select best_igl_player_id as id, count(*)::int as total
          from board_votes
          group by best_igl_player_id
        ) grouped
      ),
      winner_votes as (
        select coalesce(jsonb_object_agg(id, total), '{}'::jsonb) as data
        from (
          select winner_team_id as id, count(*)::int as total
          from board_votes
          group by winner_team_id
        ) grouped
      )
      select
        (select count(*)::int from board_votes) as total,
        (select data from mvp_votes) as mvp_votes_by_player_id,
        (select data from igl_votes) as igl_votes_by_player_id,
        (select data from winner_votes) as winner_votes_by_team_id
    `,
    [boardId]
  );

  const row = (result.rows as Array<{
    total: number;
    mvp_votes_by_player_id: Record<string, number> | null;
    igl_votes_by_player_id: Record<string, number> | null;
    winner_votes_by_team_id: Record<string, number> | null;
  }>)[0];

  return {
    totalVotes: row?.total ?? 0,
    mvpVotesByPlayerId: row?.mvp_votes_by_player_id ?? {},
    iglVotesByPlayerId: row?.igl_votes_by_player_id ?? {},
    winnerVotesByTeamId: row?.winner_votes_by_team_id ?? {},
  };
}

export async function getCommunityVoteForUser(boardId: string, userId: string): Promise<CommunityVote | null> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        id,
        board_id,
        user_id,
        mvp_player_id,
        best_igl_player_id,
        winner_team_id,
        created_at::text as created_at
      from public.community_board_votes
      where board_id = $1 and user_id = $2
      limit 1
    `,
    [boardId, userId]
  );

  const rows = result.rows as DbVoteRow[];
  return rows[0] ? mapVote(rows[0]) : null;
}

export async function listCommunityPosts(viewerUserId: string | null = null): Promise<CommunityPost[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      with reaction_totals as (
        select
          post_id,
          count(*) filter (where reaction_type = 'like')::int as like_count,
          count(*) filter (where reaction_type = 'dislike')::int as dislike_count
        from public.community_post_reactions
        group by post_id
      ),
      viewer_reactions as (
        select post_id, reaction_type
        from public.community_post_reactions
        where $1::text is not null and user_id = $1
      )
      select
        p.id,
        p.author_user_id,
        u.username as author_username,
        p.body,
        p.created_at::text as created_at,
        p.updated_at::text as updated_at,
        coalesce(rt.like_count, 0) as like_count,
        coalesce(rt.dislike_count, 0) as dislike_count,
        vr.reaction_type as viewer_reaction
      from public.community_posts p
      join public.community_users u on u.id = p.author_user_id
      left join reaction_totals rt on rt.post_id = p.id
      left join viewer_reactions vr on vr.post_id = p.id
      order by p.created_at desc
      limit 50
    `,
    [viewerUserId]
  );

  return (result.rows as DbCommunityPostRow[]).map(mapCommunityPost);
}

export async function createCommunityPost(userId: string, body: string): Promise<CommunityPost> {
  const validationError = validateCommunityPostBody(body);
  if (validationError) {
    throw new Error(validationError);
  }

  const pool = ensurePool();
  const postId = makeId("community_post");
  await pool.query(
    `
      insert into public.community_posts (id, author_user_id, body, updated_at)
      values ($1, $2, $3, now())
    `,
    [postId, userId, normalizeCommunityPostBody(body)]
  );

  const post = await getCommunityPostById(postId, userId);
  if (!post) {
    throw new Error("Post could not be loaded after creation.");
  }

  return post;
}

export async function toggleCommunityPostReaction(
  userId: string,
  postId: string,
  reactionType: CommunityPostReactionType
): Promise<CommunityPost> {
  if (!isCommunityPostReactionType(reactionType)) {
    throw new Error("Reaction type is invalid.");
  }

  const pool = ensurePool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const postCheck = await client.query(`select id from public.community_posts where id = $1 for update`, [postId]);
    const postRows = postCheck.rows as Array<{ id: string }>;
    if (!postRows[0]) {
      throw new Error("Post not found.");
    }

    const existingReactionResult = await client.query(
      `
        select id, reaction_type
        from public.community_post_reactions
        where post_id = $1 and user_id = $2
        limit 1
        for update
      `,
      [postId, userId]
    );

    const existingRows = existingReactionResult.rows as Array<{ id: string; reaction_type: CommunityPostReactionType }>;
    const existingReaction = existingRows[0];

    if (!existingReaction) {
      await client.query(
        `
          insert into public.community_post_reactions (id, post_id, user_id, reaction_type, updated_at)
          values ($1, $2, $3, $4, now())
        `,
        [makeId("community_post_reaction"), postId, userId, reactionType]
      );
    } else if (existingReaction.reaction_type === reactionType) {
      await client.query(`delete from public.community_post_reactions where id = $1`, [existingReaction.id]);
    } else {
      await client.query(
        `
          update public.community_post_reactions
          set reaction_type = $2, updated_at = now()
          where id = $1
        `,
        [existingReaction.id, reactionType]
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  const post = await getCommunityPostById(postId, userId);
  if (!post) {
    throw new Error("Post could not be reloaded after reaction update.");
  }

  return post;
}

export async function getFeaturedCommunityBoard(): Promise<CommunityBoard | null> {
  const pool = ensurePool();
  const boardResult = await pool.query(
    `
      with featured_board as (
        select
          b.id,
          b.tournament_id,
          t.name as tournament_name,
          t.status as tournament_status,
          b.headline,
          b.description,
          b.is_featured,
          b.voting_state,
          b.created_at,
          b.updated_at
        from public.community_boards b
        join public.tournaments t on t.id = b.tournament_id
        where b.is_featured = true
          and b.voting_state = 'open'
          and t.status = 'live'
        limit 1
      )
      select
        fb.id,
        fb.tournament_id,
        fb.tournament_name,
        fb.tournament_status,
        fb.headline,
        fb.description,
        fb.is_featured,
        fb.voting_state,
        fb.created_at::text as created_at,
        fb.updated_at::text as updated_at,
        coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', teams.id,
              'boardId', teams.board_id,
              'name', teams.name,
              'shortName', teams.short_name,
              'sortOrder', teams.sort_order,
              'players', teams.players
            )
            order by teams.sort_order asc, teams.name asc
          ) filter (where teams.id is not null),
          '[]'::jsonb
        ) as teams
      from featured_board fb
      left join lateral (
        select
          team.id,
          team.board_id,
          team.name,
          team.short_name,
          team.sort_order,
          coalesce(
            jsonb_agg(
              jsonb_build_object(
                'id', player.id,
                'teamId', player.team_id,
                'displayName', player.display_name,
                'role', player.role,
                'isMvpCandidate', player.is_mvp_candidate,
                'isIglCandidate', player.is_igl_candidate,
                'sortOrder', player.sort_order
              )
              order by player.sort_order asc, player.display_name asc
            ) filter (where player.id is not null),
            '[]'::jsonb
          ) as players
        from public.community_board_teams team
        left join public.community_board_players player on player.team_id = team.id
        where team.board_id = fb.id
        group by team.id
      ) teams on true
      group by
        fb.id,
        fb.tournament_id,
        fb.tournament_name,
        fb.tournament_status,
        fb.headline,
        fb.description,
        fb.is_featured,
        fb.voting_state,
        fb.created_at,
        fb.updated_at
    `
  );

  const rows = boardResult.rows as Array<DbBoardRow & {
    teams: Array<{
      id: string;
      boardId: string;
      name: string;
      shortName: string | null;
      sortOrder: number;
      players: Array<{
        id: string;
        teamId: string;
        displayName: string;
        role: string | null;
        isMvpCandidate: boolean;
        isIglCandidate: boolean;
        sortOrder: number;
      }>;
    }>;
  }>;
  const row = rows[0];
  if (!row) return null;

  const teams = row.teams.map((team) => ({
    id: team.id,
    boardId: team.boardId,
    name: team.name,
    shortName: team.shortName,
    sortOrder: team.sortOrder,
    players: team.players.map((player) => ({
      id: player.id,
      teamId: player.teamId,
      displayName: player.displayName,
      role: player.role,
      isMvpCandidate: player.isMvpCandidate,
      isIglCandidate: player.isIglCandidate,
      sortOrder: player.sortOrder,
    })),
  }));
  return mapBoard(row, teams);
}

export async function submitCommunityVote(userId: string, payload: CommunityVotePayload): Promise<CommunityVote> {
  const pool = ensurePool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const boardResult = await client.query(
      `
        select
          b.id,
          b.tournament_id,
          t.name as tournament_name,
          t.status as tournament_status,
          b.headline,
          b.description,
          b.is_featured,
          b.voting_state,
          b.created_at::text as created_at,
          b.updated_at::text as updated_at
        from public.community_boards b
        join public.tournaments t on t.id = b.tournament_id
        where b.id = $1
        for update
      `,
      [payload.boardId]
    );

    const boardRows = boardResult.rows as DbBoardRow[];
    const board = boardRows[0];
    if (!board) {
      throw new Error("Community board not found.");
    }

    if (!board.is_featured || board.voting_state !== "open" || board.tournament_status !== "live") {
      throw new Error("Voting is not open for this board.");
    }

    const [teamCheck, mvpCheck, iglCheck] = await Promise.all([
      client.query(
        `
          select id
          from public.community_board_teams
          where id = $1 and board_id = $2
          limit 1
        `,
        [payload.winnerTeamId, payload.boardId]
      ),
      client.query(
        `
          select p.id
          from public.community_board_players p
          join public.community_board_teams t on t.id = p.team_id
          where p.id = $1
            and t.board_id = $2
            and p.is_mvp_candidate = true
          limit 1
        `,
        [payload.mvpPlayerId, payload.boardId]
      ),
      client.query(
        `
          select p.id
          from public.community_board_players p
          join public.community_board_teams t on t.id = p.team_id
          where p.id = $1
            and t.board_id = $2
            and p.is_igl_candidate = true
          limit 1
        `,
        [payload.bestIglPlayerId, payload.boardId]
      ),
    ]);

    if (!(teamCheck.rows as Array<{ id: string }>)[0]) {
      throw new Error("Winner team must belong to the board.");
    }

    if (!(mvpCheck.rows as Array<{ id: string }>)[0]) {
      throw new Error("MVP player must be an eligible MVP candidate on this board.");
    }

    if (!(iglCheck.rows as Array<{ id: string }>)[0]) {
      throw new Error("Best IGL player must be an eligible IGL candidate on this board.");
    }

    const voteInsert = await client.query(
      `
        insert into public.community_board_votes (
          id,
          board_id,
          user_id,
          mvp_player_id,
          best_igl_player_id,
          winner_team_id
        )
        values ($1, $2, $3, $4, $5, $6)
        returning
          id,
          board_id,
          user_id,
          mvp_player_id,
          best_igl_player_id,
          winner_team_id,
          created_at::text as created_at
      `,
      [
        makeId("community_vote"),
        payload.boardId,
        userId,
        payload.mvpPlayerId,
        payload.bestIglPlayerId,
        payload.winnerTeamId,
      ]
    );

    await client.query("commit");
    const rows = voteInsert.rows as DbVoteRow[];
    return mapVote(rows[0]);
  } catch (error) {
    await client.query("rollback");
    if ((error as { code?: string }).code === "23505") {
      throw new Error("You have already voted for this board.");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function listLiveTournamentOptionsForCommunity(): Promise<Array<{ id: string; name: string }>> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select id, name
      from public.tournaments
      where status = 'live'
      order by year desc, month desc nulls last, name asc
    `
  );

  return result.rows as Array<{ id: string; name: string }>;
}

export async function listAdminCommunityBoards(): Promise<AdminCommunityBoard[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        b.id,
        b.tournament_id,
        t.name as tournament_name,
        t.status as tournament_status,
        b.headline,
        b.description,
        b.is_featured,
        b.voting_state,
        b.created_at::text as created_at,
        b.updated_at::text as updated_at
      from public.community_boards b
      join public.tournaments t on t.id = b.tournament_id
      order by b.created_at desc
    `
  );

  const boardRows = result.rows as DbBoardRow[];
  const boards: AdminCommunityBoard[] = [];

  for (const row of boardRows) {
    const teams = await loadBoardTeamsAndPlayers(row.id);
    const voteAggregate = await getCommunityVoteAggregate(row.id);
    boards.push({
      ...mapBoard(row, teams),
      voteAggregate,
    });
  }

  return boards;
}

export async function createAdminCommunityBoard(
  input: CreateCommunityBoardInput
): Promise<AdminCommunityBoard> {
  const pool = ensurePool();
  const client = await pool.connect();

  const votingState = input.votingState ?? "draft";
  const isFeatured = Boolean(input.isFeatured);

  try {
    await client.query("begin");

    if (isFeatured) {
      await client.query(`update public.community_boards set is_featured = false where is_featured = true`);
    }

    const result = await client.query(
      `
        insert into public.community_boards (
          id,
          tournament_id,
          headline,
          description,
          voting_state,
          is_featured,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, now())
        returning
          id,
          tournament_id,
          (select name from public.tournaments where id = tournament_id) as tournament_name,
          (select status from public.tournaments where id = tournament_id) as tournament_status,
          headline,
          description,
          is_featured,
          voting_state,
          created_at::text as created_at,
          updated_at::text as updated_at
      `,
      [
        makeId("community_board"),
        input.tournamentId,
        input.headline?.trim() || null,
        input.description?.trim() || null,
        votingState,
        isFeatured,
      ]
    );

    const teamSoulPlayersResult = await client.query(
      `
        select id, display_name, role
        from public.players
        where is_active = true
          and coalesce(current_status, 'active') = 'active'
        order by display_name asc
      `
    );

    const teamSoulPlayers = teamSoulPlayersResult.rows as DbRosterPlayerRow[];
    const boardRow = (result.rows as DbBoardRow[])[0];

    if (teamSoulPlayers.length > 0) {
      const teamId = makeId("community_team");
      await client.query(
        `
          insert into public.community_board_teams (id, board_id, name, short_name, sort_order)
          values ($1, $2, $3, $4, $5)
        `,
        [teamId, boardRow.id, "Team SouL", "SOUL", 0]
      );

      const hasIgl = teamSoulPlayers.some((player) => isIglRole(player.role));
      for (let index = 0; index < teamSoulPlayers.length; index += 1) {
        const player = teamSoulPlayers[index];
        await client.query(
          `
            insert into public.community_board_players (
              id,
              team_id,
              display_name,
              role,
              is_mvp_candidate,
              is_igl_candidate,
              sort_order
            )
            values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            makeId("community_player"),
            teamId,
            player.display_name,
            player.role,
            true,
            hasIgl ? isIglRole(player.role) : index === 0,
            index,
          ]
        );
      }
    }

    await client.query("commit");

    const rows = [boardRow];
    const seededTeams = await loadBoardTeamsAndPlayers(boardRow.id);
    return {
      ...mapBoard(rows[0], seededTeams),
      voteAggregate: {
        totalVotes: 0,
        mvpVotesByPlayerId: {},
        iglVotesByPlayerId: {},
        winnerVotesByTeamId: {},
      },
    };
  } catch (error) {
    await client.query("rollback");
    if ((error as { code?: string }).code === "23505") {
      throw new Error("A board for this tournament already exists or another board is already featured.");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAdminCommunityBoard(
  boardId: string,
  input: UpdateCommunityBoardInput
): Promise<AdminCommunityBoard> {
  const pool = ensurePool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const boardCheck = await client.query(`select id from public.community_boards where id = $1 for update`, [boardId]);
    const boardRows = boardCheck.rows as Array<{ id: string }>;
    if (!boardRows[0]) {
      throw new Error("Community board not found.");
    }

    if (input.isFeatured) {
      await client.query(
        `update public.community_boards set is_featured = false, updated_at = now() where is_featured = true and id <> $1`,
        [boardId]
      );
    }

    await client.query(
      `
        update public.community_boards
        set
          headline = coalesce($2::text, headline),
          description = coalesce($3::text, description),
          voting_state = coalesce($4::text, voting_state),
          is_featured = coalesce($5::boolean, is_featured),
          updated_at = now()
        where id = $1
      `,
      [
        boardId,
        input.headline === undefined ? null : input.headline?.trim() || null,
        input.description === undefined ? null : input.description?.trim() || null,
        input.votingState ?? null,
        input.isFeatured ?? null,
      ]
    );

    if (input.teams) {
      const existingTeamsResult = await client.query(
        `select id from public.community_board_teams where board_id = $1`,
        [boardId]
      );
      const existingTeamIds = new Set((existingTeamsResult.rows as Array<{ id: string }>).map((row) => row.id));
      const keepTeamIds: string[] = [];

      for (const teamInput of input.teams) {
        const teamId = teamInput.id && existingTeamIds.has(teamInput.id)
          ? teamInput.id
          : makeId("community_team");

        keepTeamIds.push(teamId);

        await client.query(
          `
            insert into public.community_board_teams (id, board_id, name, short_name, sort_order)
            values ($1, $2, $3, $4, $5)
            on conflict (id) do update
              set name = excluded.name,
                  short_name = excluded.short_name,
                  sort_order = excluded.sort_order
          `,
          [teamId, boardId, teamInput.name.trim(), teamInput.shortName?.trim() || null, teamInput.sortOrder]
        );

        const existingPlayersResult = await client.query(
          `select id from public.community_board_players where team_id = $1`,
          [teamId]
        );
        const existingPlayerIds = new Set((existingPlayersResult.rows as Array<{ id: string }>).map((row) => row.id));
        const keepPlayerIds: string[] = [];

        for (const playerInput of teamInput.players) {
          const playerId = playerInput.id && existingPlayerIds.has(playerInput.id)
            ? playerInput.id
            : makeId("community_player");

          keepPlayerIds.push(playerId);

          await client.query(
            `
              insert into public.community_board_players (
                id,
                team_id,
                display_name,
                role,
                is_mvp_candidate,
                is_igl_candidate,
                sort_order
              )
              values ($1, $2, $3, $4, $5, $6, $7)
              on conflict (id) do update
                set display_name = excluded.display_name,
                    role = excluded.role,
                    is_mvp_candidate = excluded.is_mvp_candidate,
                    is_igl_candidate = excluded.is_igl_candidate,
                    sort_order = excluded.sort_order
            `,
            [
              playerId,
              teamId,
              playerInput.displayName.trim(),
              playerInput.role?.trim() || null,
              playerInput.isMvpCandidate ?? true,
              playerInput.isIglCandidate ?? false,
              playerInput.sortOrder,
            ]
          );
        }

        if (keepPlayerIds.length) {
          await client.query(
            `
              delete from public.community_board_players
              where team_id = $1
                and not (id = any($2::text[]))
            `,
            [teamId, keepPlayerIds]
          );
        } else {
          await client.query(`delete from public.community_board_players where team_id = $1`, [teamId]);
        }
      }

      if (keepTeamIds.length) {
        await client.query(
          `
            delete from public.community_board_teams
            where board_id = $1
              and not (id = any($2::text[]))
          `,
          [boardId, keepTeamIds]
        );
      } else {
        await client.query(`delete from public.community_board_teams where board_id = $1`, [boardId]);
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    if ((error as { code?: string }).code === "23505") {
      throw new Error("Another board is already featured.");
    }
    throw error;
  } finally {
    client.release();
  }

  const boards = await listAdminCommunityBoards();
  const board = boards.find((item) => item.id === boardId);
  if (!board) {
    throw new Error("Community board update could not be verified.");
  }

  return board;
}

export async function deleteAdminCommunityBoard(boardId: string): Promise<void> {
  const pool = ensurePool();
  await pool.query(`delete from public.community_boards where id = $1`, [boardId]);
}

export async function listPublicCommunityLiveEvents(boardId?: string | null): Promise<CommunityLiveEvent[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        e.id,
        e.board_id,
        e.tournament_id,
        t.name as tournament_name,
        e.event_type,
        e.title,
        e.body,
        e.payload,
        e.status,
        e.is_pinned,
        e.published_at::text as published_at,
        e.expires_at::text as expires_at,
        e.created_at::text as created_at,
        e.updated_at::text as updated_at
      from public.community_live_events e
      left join public.tournaments t on t.id = e.tournament_id
      where e.status in ('published','pinned')
        and (e.expires_at is null or e.expires_at > now())
        and ($1::text is null or e.board_id = $1)
      order by e.is_pinned desc, e.status = 'pinned' desc, e.published_at desc nulls last, e.created_at desc
      limit 12
    `,
    [boardId ?? null]
  );

  return (result.rows as DbCommunityLiveEventRow[]).map(mapLiveEvent);
}

export async function getCommunityReactionSummaries(
  liveEventIds: string[]
): Promise<Record<string, CommunityReactionSummary>> {
  if (!liveEventIds.length) return {};

  const pool = ensurePool();
  const result = await pool.query(
    `
      select live_event_id, reaction_key, count(*)::int as total
      from public.community_reactions
      where live_event_id = any($1::text[])
      group by live_event_id, reaction_key
    `,
    [liveEventIds]
  );

  const grouped = new Map<string, Array<{ reactionKey: CommunityReactionKey; total: number }>>();
  for (const row of result.rows as Array<{ live_event_id: string; reaction_key: string; total: number }>) {
    if (!isCommunityReactionKey(row.reaction_key)) continue;
    const current = grouped.get(row.live_event_id) ?? [];
    current.push({ reactionKey: row.reaction_key, total: row.total });
    grouped.set(row.live_event_id, current);
  }

  const summaries: Record<string, CommunityReactionSummary> = {};
  for (const liveEventId of liveEventIds) {
    summaries[liveEventId] = buildReactionSummary(liveEventId, grouped.get(liveEventId) ?? []);
  }

  return summaries;
}

export async function getCommunityReactionsForUser(
  userId: string,
  liveEventIds: string[]
): Promise<Record<string, CommunityReactionKey[]>> {
  if (!liveEventIds.length) return {};

  const pool = ensurePool();
  const result = await pool.query(
    `
      select live_event_id, reaction_key
      from public.community_reactions
      where user_id = $1
        and live_event_id = any($2::text[])
      order by created_at desc
    `,
    [userId, liveEventIds]
  );

  const reactions: Record<string, CommunityReactionKey[]> = {};
  for (const row of result.rows as Array<{ live_event_id: string; reaction_key: string }>) {
    if (!isCommunityReactionKey(row.reaction_key)) continue;
    reactions[row.live_event_id] = [...(reactions[row.live_event_id] ?? []), row.reaction_key];
  }

  return reactions;
}

export async function submitCommunityReaction(
  userId: string,
  payload: CommunityReactionPayload
): Promise<{ reaction: CommunityReaction; summary: CommunityReactionSummary }> {
  if (!isCommunityReactionKey(payload.reactionKey)) {
    throw new Error("Unsupported reaction.");
  }

  const pool = ensurePool();
  const eventCheck = await pool.query(
    `
      select id
      from public.community_live_events
      where id = $1
        and status in ('published','pinned')
        and (expires_at is null or expires_at > now())
      limit 1
    `,
    [payload.liveEventId]
  );

  if (!(eventCheck.rows as Array<{ id: string }>)[0]) {
    throw new Error("Live event is not available.");
  }

  const insertResult = await pool.query(
    `
      insert into public.community_reactions (id, live_event_id, user_id, reaction_key)
      values ($1, $2, $3, $4)
      on conflict (live_event_id, user_id, reaction_key) do nothing
      returning id, live_event_id, user_id, reaction_key, created_at::text as created_at
    `,
    [makeId("community_reaction"), payload.liveEventId, userId, payload.reactionKey]
  );

  let row = (insertResult.rows as DbCommunityReactionRow[])[0];
  if (!row) {
    const existing = await pool.query(
      `
        select id, live_event_id, user_id, reaction_key, created_at::text as created_at
        from public.community_reactions
        where live_event_id = $1
          and user_id = $2
          and reaction_key = $3
        limit 1
      `,
      [payload.liveEventId, userId, payload.reactionKey]
    );
    row = (existing.rows as DbCommunityReactionRow[])[0];
  }

  const summaries = await getCommunityReactionSummaries([payload.liveEventId]);
  return {
    reaction: mapReaction(row),
    summary: summaries[payload.liveEventId],
  };
}

async function getFanActivityStats(userId: string): Promise<{
  votesCount: number;
  reactionsCount: number;
  badgesCount: number;
}> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        (select count(*)::int from public.community_board_votes where user_id = $1) as votes_count,
        (select count(*)::int from public.community_reactions where user_id = $1) as reactions_count,
        (select count(*)::int from public.community_badges where user_id = $1) as badges_count
    `,
    [userId]
  );

  const row = (result.rows as Array<{ votes_count: number; reactions_count: number; badges_count: number }>)[0];
  return {
    votesCount: row?.votes_count ?? 0,
    reactionsCount: row?.reactions_count ?? 0,
    badgesCount: row?.badges_count ?? 0,
  };
}

export async function getCommunityBadgesForUser(userId: string): Promise<CommunityBadge[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select id, user_id, badge_key, label, description, source, earned_at::text as earned_at
      from public.community_badges
      where user_id = $1
      order by earned_at desc
    `,
    [userId]
  );

  return (result.rows as DbCommunityBadgeRow[]).map(mapBadge);
}

export async function claimCommunityBadge(
  userId: string,
  payload: CommunityBadgeClaimPayload
): Promise<CommunityBadge> {
  const badgeKey = payload.badgeKey?.trim();
  if (!badgeKey) {
    throw new Error("Badge key is required.");
  }

  const stats = await getFanActivityStats(userId);
  if (!canClaimBadge(badgeKey, stats)) {
    throw new Error("Badge is not available yet.");
  }

  const copy = badgeCopyForKey(badgeKey);
  const pool = ensurePool();
  const result = await pool.query(
    `
      insert into public.community_badges (id, user_id, badge_key, label, description, source)
      values ($1, $2, $3, $4, $5, $6)
      on conflict (user_id, badge_key) do update
        set label = excluded.label,
            description = excluded.description,
            source = excluded.source
      returning id, user_id, badge_key, label, description, source, earned_at::text as earned_at
    `,
    [makeId("community_badge"), userId, badgeKey, copy.label, copy.description, "fan_arena_os"]
  );

  return mapBadge((result.rows as DbCommunityBadgeRow[])[0]);
}

export async function getFanProfileSummary(user: CommunityUser): Promise<FanProfileSummary> {
  const [stats, badges] = await Promise.all([
    getFanActivityStats(user.id),
    getCommunityBadgesForUser(user.id),
  ]);

  return {
    user,
    votesCount: stats.votesCount,
    reactionsCount: stats.reactionsCount,
    badgesCount: badges.length,
    badges,
  };
}

export async function listPublicMediaMoments(limit = 6): Promise<MediaMoment[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        m.id,
        m.tournament_id,
        t.name as tournament_name,
        m.title,
        m.description,
        m.template_key,
        m.status,
        m.duration_seconds,
        m.accent,
        m.thumbnail_url,
        m.published_at::text as published_at,
        m.created_at::text as created_at,
        m.updated_at::text as updated_at
      from public.media_moments m
      left join public.tournaments t on t.id = m.tournament_id
      where m.status in ('published','pinned')
      order by m.status = 'pinned' desc, m.published_at desc nulls last, m.created_at desc
      limit $1
    `,
    [limit]
  );

  return (result.rows as DbMediaMomentRow[]).map(mapMediaMoment);
}

export async function listAdminCommunityLiveEvents(): Promise<CommunityLiveEvent[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        e.id,
        e.board_id,
        e.tournament_id,
        t.name as tournament_name,
        e.event_type,
        e.title,
        e.body,
        e.payload,
        e.status,
        e.is_pinned,
        e.published_at::text as published_at,
        e.expires_at::text as expires_at,
        e.created_at::text as created_at,
        e.updated_at::text as updated_at
      from public.community_live_events e
      left join public.tournaments t on t.id = e.tournament_id
      order by e.created_at desc
      limit 40
    `
  );

  return (result.rows as DbCommunityLiveEventRow[]).map(mapLiveEvent);
}

export async function createAdminCommunityLiveEvent(
  input: CreateCommunityLiveEventInput
): Promise<CommunityLiveEvent> {
  const title = input.title?.trim();
  if (!title) {
    throw new Error("Live event title is required.");
  }

  const pool = ensurePool();
  const boardId = input.boardId?.trim() || null;
  let tournamentId = input.tournamentId?.trim() || null;

  if (boardId && !tournamentId) {
    const boardResult = await pool.query(`select tournament_id from public.community_boards where id = $1 limit 1`, [
      boardId,
    ]);
    tournamentId = ((boardResult.rows as Array<{ tournament_id: string }>)[0]?.tournament_id ?? null) as string | null;
  }

  const status = normalizeFanContentStatus(input.status);
  const isPinned = Boolean(input.isPinned) || status === "pinned";
  const publishedAt = input.publishedAt ?? (status === "published" || status === "pinned" ? new Date().toISOString() : null);
  const result = await pool.query(
    `
      insert into public.community_live_events (
        id,
        board_id,
        tournament_id,
        event_type,
        title,
        body,
        payload,
        status,
        is_pinned,
        published_at,
        expires_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10::timestamptz, $11::timestamptz, now())
      returning
        id,
        board_id,
        tournament_id,
        (select name from public.tournaments where id = tournament_id) as tournament_name,
        event_type,
        title,
        body,
        payload,
        status,
        is_pinned,
        published_at::text as published_at,
        expires_at::text as expires_at,
        created_at::text as created_at,
        updated_at::text as updated_at
    `,
    [
      makeId("community_live"),
      boardId,
      tournamentId,
      input.eventType ?? "announcement",
      title,
      input.body?.trim() || null,
      JSON.stringify(input.payload ?? {}),
      status,
      isPinned,
      publishedAt,
      input.expiresAt ?? null,
    ]
  );

  return mapLiveEvent((result.rows as DbCommunityLiveEventRow[])[0]);
}

export async function updateAdminCommunityLiveEvent(
  liveEventId: string,
  input: UpdateCommunityLiveEventInput
): Promise<CommunityLiveEvent> {
  const pool = ensurePool();
  const currentResult = await pool.query(
    `
      select
        id,
        board_id,
        tournament_id,
        null::text as tournament_name,
        event_type,
        title,
        body,
        payload,
        status,
        is_pinned,
        published_at::text as published_at,
        expires_at::text as expires_at,
        created_at::text as created_at,
        updated_at::text as updated_at
      from public.community_live_events
      where id = $1
      limit 1
    `,
    [liveEventId]
  );

  const current = (currentResult.rows as DbCommunityLiveEventRow[])[0];
  if (!current) {
    throw new Error("Live event not found.");
  }

  const status = input.status === undefined ? current.status : normalizeFanContentStatus(input.status);
  const title = input.title === undefined ? current.title : input.title.trim();
  if (!title) {
    throw new Error("Live event title is required.");
  }

  const publishedAt =
    input.publishedAt === undefined
      ? current.published_at ?? (status === "published" || status === "pinned" ? new Date().toISOString() : null)
      : input.publishedAt;

  const result = await pool.query(
    `
      update public.community_live_events
      set
        board_id = $2,
        tournament_id = $3,
        event_type = $4,
        title = $5,
        body = $6,
        payload = $7::jsonb,
        status = $8,
        is_pinned = $9,
        published_at = $10::timestamptz,
        expires_at = $11::timestamptz,
        updated_at = now()
      where id = $1
      returning
        id,
        board_id,
        tournament_id,
        (select name from public.tournaments where id = tournament_id) as tournament_name,
        event_type,
        title,
        body,
        payload,
        status,
        is_pinned,
        published_at::text as published_at,
        expires_at::text as expires_at,
        created_at::text as created_at,
        updated_at::text as updated_at
    `,
    [
      liveEventId,
      input.boardId === undefined ? current.board_id : input.boardId?.trim() || null,
      input.tournamentId === undefined ? current.tournament_id : input.tournamentId?.trim() || null,
      input.eventType ?? current.event_type,
      title,
      input.body === undefined ? current.body : input.body?.trim() || null,
      JSON.stringify(input.payload === undefined ? current.payload ?? {} : input.payload ?? {}),
      status,
      input.isPinned === undefined ? current.is_pinned || status === "pinned" : Boolean(input.isPinned) || status === "pinned",
      publishedAt,
      input.expiresAt === undefined ? current.expires_at : input.expiresAt,
    ]
  );

  return mapLiveEvent((result.rows as DbCommunityLiveEventRow[])[0]);
}

export async function listAdminMediaMoments(): Promise<MediaMoment[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      select
        m.id,
        m.tournament_id,
        t.name as tournament_name,
        m.title,
        m.description,
        m.template_key,
        m.status,
        m.duration_seconds,
        m.accent,
        m.thumbnail_url,
        m.published_at::text as published_at,
        m.created_at::text as created_at,
        m.updated_at::text as updated_at
      from public.media_moments m
      left join public.tournaments t on t.id = m.tournament_id
      order by m.created_at desc
      limit 40
    `
  );

  return (result.rows as DbMediaMomentRow[]).map(mapMediaMoment);
}

export async function createAdminMediaMoment(input: CreateMediaMomentInput): Promise<MediaMoment> {
  const title = input.title?.trim();
  if (!title) {
    throw new Error("Moment title is required.");
  }

  const status = normalizeFanContentStatus(input.status);
  const durationSeconds = Math.min(60, Math.max(6, Number(input.durationSeconds ?? 18)));
  const publishedAt = input.publishedAt ?? (status === "published" || status === "pinned" ? new Date().toISOString() : null);
  const pool = ensurePool();
  const result = await pool.query(
    `
      insert into public.media_moments (
        id,
        tournament_id,
        title,
        description,
        template_key,
        status,
        duration_seconds,
        accent,
        thumbnail_url,
        published_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::timestamptz, now())
      returning
        id,
        tournament_id,
        (select name from public.tournaments where id = tournament_id) as tournament_name,
        title,
        description,
        template_key,
        status,
        duration_seconds,
        accent,
        thumbnail_url,
        published_at::text as published_at,
        created_at::text as created_at,
        updated_at::text as updated_at
    `,
    [
      makeId("media_moment"),
      input.tournamentId?.trim() || null,
      title,
      input.description?.trim() || null,
      normalizeMomentTemplate(input.templateKey),
      status,
      durationSeconds,
      input.accent ?? "cyan",
      input.thumbnailUrl?.trim() || null,
      publishedAt,
    ]
  );

  return mapMediaMoment((result.rows as DbMediaMomentRow[])[0]);
}

export async function updateAdminMediaMoment(
  momentId: string,
  input: UpdateMediaMomentInput
): Promise<MediaMoment> {
  const pool = ensurePool();
  const currentResult = await pool.query(
    `
      select
        id,
        tournament_id,
        null::text as tournament_name,
        title,
        description,
        template_key,
        status,
        duration_seconds,
        accent,
        thumbnail_url,
        published_at::text as published_at,
        created_at::text as created_at,
        updated_at::text as updated_at
      from public.media_moments
      where id = $1
      limit 1
    `,
    [momentId]
  );

  const current = (currentResult.rows as DbMediaMomentRow[])[0];
  if (!current) {
    throw new Error("Moment not found.");
  }

  const status = input.status === undefined ? current.status : normalizeFanContentStatus(input.status);
  const title = input.title === undefined ? current.title : input.title.trim();
  if (!title) {
    throw new Error("Moment title is required.");
  }

  const publishedAt =
    input.publishedAt === undefined
      ? current.published_at ?? (status === "published" || status === "pinned" ? new Date().toISOString() : null)
      : input.publishedAt;

  const result = await pool.query(
    `
      update public.media_moments
      set
        tournament_id = $2,
        title = $3,
        description = $4,
        template_key = $5,
        status = $6,
        duration_seconds = $7,
        accent = $8,
        thumbnail_url = $9,
        published_at = $10::timestamptz,
        updated_at = now()
      where id = $1
      returning
        id,
        tournament_id,
        (select name from public.tournaments where id = tournament_id) as tournament_name,
        title,
        description,
        template_key,
        status,
        duration_seconds,
        accent,
        thumbnail_url,
        published_at::text as published_at,
        created_at::text as created_at,
        updated_at::text as updated_at
    `,
    [
      momentId,
      input.tournamentId === undefined ? current.tournament_id : input.tournamentId?.trim() || null,
      title,
      input.description === undefined ? current.description : input.description?.trim() || null,
      input.templateKey === undefined ? current.template_key : normalizeMomentTemplate(input.templateKey),
      status,
      input.durationSeconds === undefined
        ? current.duration_seconds
        : Math.min(60, Math.max(6, Number(input.durationSeconds))),
      input.accent ?? current.accent,
      input.thumbnailUrl === undefined ? current.thumbnail_url : input.thumbnailUrl?.trim() || null,
      publishedAt,
    ]
  );

  return mapMediaMoment((result.rows as DbMediaMomentRow[])[0]);
}

export async function getFanEngagementSnapshot(): Promise<FanEngagementRollup[]> {
  const pool = ensurePool();
  const result = await pool.query(
    `
      with today_votes as (
        select user_id from public.community_board_votes where created_at::date = current_date
      ),
      today_reactions as (
        select user_id from public.community_reactions where created_at::date = current_date
      ),
      active_users as (
        select user_id from today_votes
        union
        select user_id from today_reactions
      )
      select
        'rollup_today' as id,
        current_date::text as rollup_date,
        null::text as board_id,
        'Fan Arena today' as board_headline,
        (select count(*)::int from today_votes) as votes_count,
        (select count(*)::int from today_reactions) as reactions_count,
        (select count(*)::int from active_users) as active_users_count,
        (select count(*)::int from public.community_badges where earned_at::date = current_date) as badges_awarded_count,
        now()::text as created_at
    `
  );

  return (result.rows as DbFanEngagementRollupRow[]).map(mapFanEngagementRollup);
}
