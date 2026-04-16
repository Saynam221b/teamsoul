import { randomUUID } from "node:crypto";
import type {
  AdminCommunityBoard,
  CommunityBoard,
  CommunityBoardPlayer,
  CommunityBoardTeam,
  CommunitySession,
  CommunityUser,
  CommunityVote,
  CommunityVoteAggregate,
  CommunityVotePayload,
  CreateCommunityBoardInput,
  UpdateCommunityBoardInput,
} from "@/data/types";
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

type DbVoteRow = {
  id: string;
  board_id: string;
  user_id: string;
  mvp_player_id: string;
  best_igl_player_id: string;
  winner_team_id: string;
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

  const [teamsResult, playersResult] = await Promise.all([
    pool.query(
      `
        select id, board_id, name, short_name, sort_order
        from public.community_board_teams
        where board_id = $1
        order by sort_order asc, name asc
      `,
      [boardId]
    ),
    pool.query(
      `
        select id, team_id, display_name, role, is_mvp_candidate, is_igl_candidate, sort_order
        from public.community_board_players
        where team_id in (
          select id from public.community_board_teams where board_id = $1
        )
        order by sort_order asc, display_name asc
      `,
      [boardId]
    ),
  ]);

  const teamRows = teamsResult.rows as DbTeamRow[];
  const playerRows = playersResult.rows as DbPlayerRow[];

  const playersByTeamId = new Map<string, CommunityBoardPlayer[]>();
  for (const row of playerRows) {
    const current = playersByTeamId.get(row.team_id) ?? [];
    current.push(mapPlayer(row));
    playersByTeamId.set(row.team_id, current);
  }

  return teamRows.map((row) => mapTeam(row, playersByTeamId.get(row.id) ?? []));
}

export async function getCommunityVoteAggregate(boardId: string): Promise<CommunityVoteAggregate> {
  const pool = ensurePool();
  const [totalResult, mvpResult, iglResult, winnerResult] = await Promise.all([
    pool.query(`select count(*)::int as total from public.community_board_votes where board_id = $1`, [boardId]),
    pool.query(
      `
        select mvp_player_id as id, count(*)::int as total
        from public.community_board_votes
        where board_id = $1
        group by mvp_player_id
      `,
      [boardId]
    ),
    pool.query(
      `
        select best_igl_player_id as id, count(*)::int as total
        from public.community_board_votes
        where board_id = $1
        group by best_igl_player_id
      `,
      [boardId]
    ),
    pool.query(
      `
        select winner_team_id as id, count(*)::int as total
        from public.community_board_votes
        where board_id = $1
        group by winner_team_id
      `,
      [boardId]
    ),
  ]);

  const totalRows = totalResult.rows as Array<{ total: number }>;
  const mvpRows = mvpResult.rows as Array<{ id: string; total: number }>;
  const iglRows = iglResult.rows as Array<{ id: string; total: number }>;
  const winnerRows = winnerResult.rows as Array<{ id: string; total: number }>;

  const toMap = (rows: Array<{ id: string; total: number }>) => {
    const mapped: Record<string, number> = {};
    rows.forEach((row) => {
      mapped[row.id] = row.total;
    });
    return mapped;
  };

  return {
    totalVotes: totalRows[0]?.total ?? 0,
    mvpVotesByPlayerId: toMap(mvpRows),
    iglVotesByPlayerId: toMap(iglRows),
    winnerVotesByTeamId: toMap(winnerRows),
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

export async function getFeaturedCommunityBoard(): Promise<CommunityBoard | null> {
  const pool = ensurePool();
  const boardResult = await pool.query(
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
      where b.is_featured = true
        and b.voting_state = 'open'
        and t.status = 'live'
      limit 1
    `
  );

  const rows = boardResult.rows as DbBoardRow[];
  const row = rows[0];
  if (!row) return null;

  const teams = await loadBoardTeamsAndPlayers(row.id);
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
          where p.id = $1 and t.board_id = $2
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
      throw new Error("MVP player must belong to the board.");
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

    await client.query("commit");

    const rows = result.rows as DbBoardRow[];
    return {
      ...mapBoard(rows[0], []),
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
