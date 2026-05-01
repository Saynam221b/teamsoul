import type { Metadata } from "next";
import CommunityClient from "@/components/community/CommunityClient";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import { getCurrentCommunityUser } from "@/lib/communityAuth";
import {
  getCommunityReactionSummaries,
  getCommunityReactionsForUser,
  getCommunityVoteAggregate,
  getCommunityVoteForUser,
  getFanProfileSummary,
  getFeaturedCommunityBoard,
  listPublicCommunityLiveEvents,
  listPublicMediaMoments,
  listCommunityPosts,
} from "@/lib/db/community";
import type {
  CommunityBoard,
  CommunityLiveEvent,
  CommunityPost,
  CommunityReactionKey,
  CommunityReactionSummary,
  CommunityUser,
  CommunityVote,
  CommunityVoteAggregate,
  FanProfileSummary,
  MediaMoment,
} from "@/data/types";

export const metadata: Metadata = {
  title: "Fan Arena - Team SOUL",
  description:
    "Join Team SOUL's Fan Arena with live pulses, reactions, badges, moments, posts, and one-shot prediction boards.",
};

export const dynamic = "force-dynamic";

type PublicCommunitySnapshot = {
  board: CommunityBoard | null;
  posts: CommunityPost[];
  voteAggregate: CommunityVoteAggregate | null;
  liveEvents: CommunityLiveEvent[];
  reactionSummary: Record<string, CommunityReactionSummary>;
  moments: MediaMoment[];
};

let publicSnapshotCache: { expiresAt: number; data: PublicCommunitySnapshot } | null = null;
const PUBLIC_SNAPSHOT_TTL_MS = 2500;

function isMissingCommunityTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("does not exist") &&
    (message.includes("community_boards") ||
      message.includes("community_users") ||
      message.includes("community_sessions") ||
      message.includes("community_board_teams") ||
      message.includes("community_board_players") ||
      message.includes("community_board_votes") ||
      message.includes("community_posts") ||
      message.includes("community_post_reactions") ||
      message.includes("community_live_events") ||
      message.includes("community_reactions") ||
      message.includes("community_badges") ||
      message.includes("media_moments") ||
      message.includes("fan_engagement_rollups"))
  );
}

async function getPublicCommunitySnapshot(): Promise<PublicCommunitySnapshot> {
  const now = Date.now();
  if (publicSnapshotCache && publicSnapshotCache.expiresAt > now) {
    return publicSnapshotCache.data;
  }

  const board = await getFeaturedCommunityBoard();
  const [posts, voteAggregate, liveEvents, moments] = await Promise.all([
    listCommunityPosts(null),
    board ? getCommunityVoteAggregate(board.id) : Promise.resolve(null),
    listPublicCommunityLiveEvents(board?.id ?? null),
    listPublicMediaMoments(4),
  ]);
  const reactionSummary = await getCommunityReactionSummaries(liveEvents.map((event) => event.id));
  const data = { board, posts, voteAggregate, liveEvents, reactionSummary, moments };

  publicSnapshotCache = {
    expiresAt: now + PUBLIC_SNAPSHOT_TTL_MS,
    data,
  };

  return data;
}

export default async function CommunityPage() {
  let user: CommunityUser | null = null;
  let board: CommunityBoard | null = null;
  let posts: CommunityPost[] = [];
  let userVote: CommunityVote | null = null;
  let voteAggregate: CommunityVoteAggregate | null = null;
  let liveEvents: CommunityLiveEvent[] = [];
  let reactionSummary: Record<string, CommunityReactionSummary> = {};
  let userReactions: Record<string, CommunityReactionKey[]> = {};
  let fanProfile: FanProfileSummary | null = null;
  let moments: MediaMoment[] = [];
  let setupMessage: string | null = null;

  try {
    user = await getCurrentCommunityUser();

    if (!user) {
      const snapshot = await getPublicCommunitySnapshot();
      board = snapshot.board;
      posts = snapshot.posts;
      voteAggregate = snapshot.voteAggregate;
      liveEvents = snapshot.liveEvents;
      reactionSummary = snapshot.reactionSummary;
      moments = snapshot.moments;
    } else {
      board = await getFeaturedCommunityBoard();
      [posts, userVote, voteAggregate, liveEvents, moments] = await Promise.all([
        listCommunityPosts(user.id),
        board ? getCommunityVoteForUser(board.id, user.id) : Promise.resolve(null),
        board ? getCommunityVoteAggregate(board.id) : Promise.resolve(null),
        listPublicCommunityLiveEvents(board?.id ?? null),
        listPublicMediaMoments(4),
      ]);

      const liveEventIds = liveEvents.map((event) => event.id);
      reactionSummary = await getCommunityReactionSummaries(liveEventIds);
      [userReactions, fanProfile] = await Promise.all([
        getCommunityReactionsForUser(user.id, liveEventIds),
        getFanProfileSummary(user),
      ]);
    }
  } catch (error) {
    if (isMissingCommunityTableError(error)) {
      setupMessage =
        "Community module tables are missing. Apply `supabase/migrations/20260416_add_community_module.sql`, `supabase/migrations/20260501_add_community_posts.sql`, and `supabase/migrations/20260501_add_fan_arena_os.sql` to enable Fan Arena.";
    } else {
      throw error;
    }
  }

  return (
    <div className="community-route relative space-y-6 overflow-hidden pt-28 md:space-y-8 md:pt-32">
      <div className="route-kinetic-layers" aria-hidden="true">
        <span className="route-kinetic-glow route-kinetic-glow-cyan" />
        <span className="route-kinetic-glow route-kinetic-glow-energy" />
        <span className="route-kinetic-lines" />
      </div>
      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap">
          <RevealOnScroll
            as="div"
            className="inner-hero route-hero route-hero-community rounded-[28px] px-5 py-7 md:rounded-[36px] md:px-10 md:py-10"
            intensity="hero"
          >
            <span className="route-hero-sweep" aria-hidden="true" />
            <p className="section-kicker">Community Arena</p>
            <h1 className="section-title">One featured live board. One vote per account.</h1>
            <p className="section-copy">
              This section is for community predictions only. Once you submit your vote for the current board,
              your picks are final.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {setupMessage ? (
        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <DataFallbackNotice messages={[setupMessage]} />
          </div>
        </section>
      ) : null}

      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap">
          <CommunityClient
            user={user}
            board={board}
            posts={posts}
            userVote={userVote}
            voteAggregate={voteAggregate}
            liveEvents={liveEvents}
            reactionSummary={reactionSummary}
            userReactions={userReactions}
            fanProfile={fanProfile}
            moments={moments}
          />
        </div>
      </section>
    </div>
  );
}
