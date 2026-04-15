import type {
  AggregateStats,
  Era,
  Organization,
  Player,
  PublicArchiveFeedResult,
  StaffMember,
  ViewershipMilestone,
} from "@/data/types";
import { getPostgresPool, isPostgresConfigured } from "@/lib/postgres";

type DbMilestoneRow = {
  event: string;
  viewers: number;
  year: number;
};

type DbEraRow = {
  id: string;
  name: string;
  year_start: number;
  year_end: number;
  description: string;
  defining_moment: string | null;
  outcome: Era["outcome"];
  story_image_url: string | null;
  story_image_alt: string | null;
};

type DbEraPlayerRow = {
  era_id: string;
  player_id: string;
};

type DbEraStaffRow = {
  era_id: string;
  staff_id: string;
};

type DbPlayerRow = {
  id: string;
  display_name: string;
  real_name: string | null;
  role: string | null;
  impact: string | null;
  is_founder: boolean;
  is_active: boolean;
  current_status: Player["currentStatus"];
};

type DbPlayerStintRow = {
  player_id: string;
  join_date: string;
  leave_date: string | null;
  join_context: string | null;
  leave_reason: string | null;
  era_id: string | null;
};

type DbAwardRow = {
  player_id: string | null;
  name: string;
  recipient: string;
  approx_price: number | null;
  tournament_id: string | null;
};

type DbStaffRow = {
  id: string;
  display_name: string;
  real_name: string | null;
  role: string | null;
  join_date: string;
  leave_date: string | null;
  is_active: boolean;
  impact: string | null;
};

type DbStaffEraRow = {
  staff_id: string;
  era_id: string;
};

const EMPTY_ORGANIZATION: Organization = {
  name: "Team SOUL",
  founded: "",
  parentOrg: "",
  parentOrgFormed: "",
  totalEarnings: 0,
  bgmiEarnings: 0,
  totalTournaments: 0,
  totalMatches: 0,
  peakViewership: 0,
  peakViewershipEvent: "",
  peakViewershipYear: 0,
  viewershipMilestones: [],
};

const EMPTY_STATS: AggregateStats = {
  totalWins: 0,
  totalPrize: 0,
  winsByTier: {},
  tournamentsByYear: {},
  bestPlacement: { tournament: "", placement: 0, prize: 0 },
};

function buildUnavailableArchive(message: string): PublicArchiveFeedResult {
  return {
    organization: EMPTY_ORGANIZATION,
    stats: EMPTY_STATS,
    eras: [],
    players: [],
    staff: [],
    source: "unavailable",
    message,
  };
}

export function getArchiveFeedUnavailableMessage(message?: string): string {
  return message ?? "Archive data is unavailable right now.";
}

export async function getPublicArchiveFeed(): Promise<PublicArchiveFeedResult> {
  if (!isPostgresConfigured()) {
    return buildUnavailableArchive("Live archive data is not configured.");
  }

  const pool = getPostgresPool();
  if (!pool) {
    return buildUnavailableArchive("Live archive data could not initialize.");
  }

  try {
    const [
      organizationResult,
      milestonesResult,
      erasResult,
      eraPlayersResult,
      eraStaffResult,
      playersResult,
      playerStintsResult,
      awardsResult,
      staffResult,
      staffErasResult,
      statsResult,
    ] = await Promise.all([
      pool.query(
        `
          select
            name,
            founded,
            parent_org,
            parent_org_formed,
            total_earnings,
            bgmi_earnings,
            total_tournaments,
            total_matches,
            peak_viewership,
            peak_viewership_event,
            peak_viewership_year
          from public.organizations
          where id = $1
        `,
        ["team-soul"]
      ),
      pool.query(
        `
          select event, viewers, year
          from public.viewership_milestones
          where organization_id = $1
          order by year asc
        `,
        ["team-soul"]
      ),
      pool.query(
        `
          select
            id,
            name,
            year_start,
            year_end,
            description,
            defining_moment,
            outcome,
            story_image_url,
            story_image_alt
          from public.eras
          order by year_start asc
        `
      ),
      pool.query(
        `
          select era_id, player_id
          from public.era_key_players
        `
      ),
      pool.query(
        `
          select era_id, staff_id
          from public.staff_eras
        `
      ),
      pool.query(
        `
          select
            id,
            display_name,
            real_name,
            role,
            impact,
            is_founder,
            is_active,
            current_status
          from public.players
          order by display_name asc
        `
      ),
      pool.query(
        `
          select
            player_id,
            join_date::text as join_date,
            leave_date::text as leave_date,
            join_context,
            leave_reason,
            era_id
          from public.player_stints
          order by join_date asc
        `
      ),
      pool.query(
        `
          select
            player_id,
            name,
            recipient,
            approx_price,
            tournament_id
          from public.awards
          where player_id is not null
        `
      ),
      pool.query(
        `
          select
            id,
            display_name,
            real_name,
            role,
            join_date::text as join_date,
            leave_date::text as leave_date,
            is_active,
            impact
          from public.staff_members
          order by display_name asc
        `
      ),
      pool.query(
        `
          select staff_id, era_id
          from public.staff_eras
        `
      ),
      pool.query(
        `
          select
            total_wins,
            total_approx_price,
            wins_by_tier,
            tournaments_by_year,
            best_placement_tournament,
            best_placement,
            best_placement_approx_price
          from public.aggregate_stats
          where id = $1
        `,
        ["team-soul-stats"]
      ),
    ]);

    if (!organizationResult.rows[0] || !statsResult.rows[0]) {
      return buildUnavailableArchive("Archive rows are missing from Postgres.");
    }

    const milestoneRows = milestonesResult.rows as DbMilestoneRow[];
    const eraRows = erasResult.rows as DbEraRow[];
    const eraPlayerRows = eraPlayersResult.rows as DbEraPlayerRow[];
    const eraStaffRows = eraStaffResult.rows as DbEraStaffRow[];
    const playerRows = playersResult.rows as DbPlayerRow[];
    const playerStintRows = playerStintsResult.rows as DbPlayerStintRow[];
    const awardRows = awardsResult.rows as DbAwardRow[];
    const staffRows = staffResult.rows as DbStaffRow[];
    const staffEraRows = staffErasResult.rows as DbStaffEraRow[];

    const milestones: ViewershipMilestone[] = milestoneRows.map((item: DbMilestoneRow) => ({
      event: item.event,
      viewers: item.viewers,
      year: item.year,
    }));

    const eraPlayersByEra = eraPlayerRows.reduce(
      (acc: Record<string, string[]>, row: DbEraPlayerRow) => {
        if (!acc[row.era_id]) acc[row.era_id] = [];
        acc[row.era_id].push(row.player_id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    const eraStaffByEra = eraStaffRows.reduce(
      (acc: Record<string, string[]>, row: DbEraStaffRow) => {
        if (!acc[row.era_id]) acc[row.era_id] = [];
        acc[row.era_id].push(row.staff_id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    const eras: Era[] = eraRows.map((row: DbEraRow) => ({
      id: row.id,
      name: row.name,
      yearRange: [row.year_start, row.year_end],
      description: row.description,
      keyPlayers: eraPlayersByEra[row.id] ?? [],
      staff: eraStaffByEra[row.id] ?? [],
      storyImageUrl: row.story_image_url ?? undefined,
      storyImageAlt: row.story_image_alt ?? undefined,
      definingMoment: row.defining_moment ?? "",
      outcome: row.outcome,
    }));

    const stintsByPlayer = playerStintRows.reduce(
      (acc: Record<string, Player["stints"]>, row: DbPlayerStintRow) => {
        if (!acc[row.player_id]) acc[row.player_id] = [];
        acc[row.player_id].push({
          joinDate: row.join_date,
          leaveDate: row.leave_date,
          joinContext: row.join_context ?? "",
          leaveReason: row.leave_reason ?? undefined,
          era: row.era_id ?? "",
        });
        return acc;
      },
      {} as Record<string, Player["stints"]>
    );

    const awardsByPlayer = awardRows.reduce(
      (acc: Record<string, Player["awards"]>, row: DbAwardRow) => {
        if (!row.player_id) return acc;
        if (!acc[row.player_id]) acc[row.player_id] = [];
        acc[row.player_id].push({
          name: row.name,
          recipient: row.recipient,
          prize: row.approx_price ?? undefined,
          tournament: row.tournament_id ?? "",
        });
        return acc;
      },
      {} as Record<string, Player["awards"]>
    );

    const players: Player[] = playerRows.map((row: DbPlayerRow) => ({
      id: row.id,
      displayName: row.display_name,
      realName: row.real_name ?? "",
      role: row.role ?? "",
      impact: row.impact ?? "",
      isFounder: row.is_founder,
      isActive: row.is_active,
      currentStatus: row.current_status,
      stints: (stintsByPlayer[row.id] ?? []).sort(
        (a: Player["stints"][number], b: Player["stints"][number]) =>
          a.joinDate.localeCompare(b.joinDate)
      ),
      awards: awardsByPlayer[row.id] ?? [],
    }));

    const erasByStaff = staffEraRows.reduce(
      (acc: Record<string, string[]>, row: DbStaffEraRow) => {
        if (!acc[row.staff_id]) acc[row.staff_id] = [];
        acc[row.staff_id].push(row.era_id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    const staff: StaffMember[] = staffRows.map((row: DbStaffRow) => ({
      id: row.id,
      displayName: row.display_name,
      realName: row.real_name ?? "",
      role: row.role ?? "",
      joinDate: row.join_date,
      leaveDate: row.leave_date,
      isActive: row.is_active,
      impact: row.impact ?? "",
      eras: erasByStaff[row.id] ?? [],
    }));

    const orgRow = organizationResult.rows[0];
    const organization: Organization = {
      name: orgRow.name,
      founded: orgRow.founded,
      parentOrg: orgRow.parent_org,
      parentOrgFormed: orgRow.parent_org_formed,
      totalEarnings: orgRow.total_earnings ?? 0,
      bgmiEarnings: orgRow.bgmi_earnings ?? 0,
      totalTournaments: orgRow.total_tournaments ?? 0,
      totalMatches: orgRow.total_matches ?? 0,
      peakViewership: orgRow.peak_viewership ?? 0,
      peakViewershipEvent: orgRow.peak_viewership_event ?? "",
      peakViewershipYear: orgRow.peak_viewership_year ?? 0,
      viewershipMilestones: milestones,
    };

    const statsRow = statsResult.rows[0];
    const bestPlacementValue = statsRow.best_placement ? Number(statsRow.best_placement) : 0;
    const stats: AggregateStats = {
      totalWins: statsRow.total_wins ?? 0,
      totalPrize: statsRow.total_approx_price ?? 0,
      winsByTier: statsRow.wins_by_tier ?? {},
      tournamentsByYear: Object.fromEntries(
        Object.entries(statsRow.tournaments_by_year ?? {}).map(([year, value]) => [
          Number(year),
          Number(value),
        ])
      ) as Record<number, number>,
      bestPlacement: {
        tournament: statsRow.best_placement_tournament ?? "",
        placement: Number.isFinite(bestPlacementValue) ? bestPlacementValue : 0,
        prize: statsRow.best_placement_approx_price ?? 0,
      },
    };

    return {
      organization,
      stats,
      eras,
      players,
      staff,
      source: "db",
    };
  } catch (error) {
    return buildUnavailableArchive(
      `Live archive data is temporarily unavailable. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
