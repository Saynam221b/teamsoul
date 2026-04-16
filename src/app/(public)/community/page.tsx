import type { Metadata } from "next";
import CommunityClient from "@/components/community/CommunityClient";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import { getCurrentCommunityUser } from "@/lib/communityAuth";
import {
  getCommunityVoteAggregate,
  getCommunityVoteForUser,
  getFeaturedCommunityBoard,
} from "@/lib/db/community";
import type {
  CommunityBoard,
  CommunityUser,
  CommunityVote,
  CommunityVoteAggregate,
} from "@/data/types";

export const metadata: Metadata = {
  title: "Community Voting - Team SOUL Archive",
  description:
    "Log in, join the community board, and cast one vote for MVP, Best IGL, and winner predictions.",
};

export const dynamic = "force-dynamic";

function isMissingCommunityTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("does not exist") &&
    (message.includes("community_boards") ||
      message.includes("community_users") ||
      message.includes("community_sessions") ||
      message.includes("community_board_teams") ||
      message.includes("community_board_players") ||
      message.includes("community_board_votes"))
  );
}

export default async function CommunityPage() {
  let user: CommunityUser | null = null;
  let board: CommunityBoard | null = null;
  let userVote: CommunityVote | null = null;
  let voteAggregate: CommunityVoteAggregate | null = null;
  let setupMessage: string | null = null;

  try {
    user = await getCurrentCommunityUser();
    board = await getFeaturedCommunityBoard();
    userVote = user && board ? await getCommunityVoteForUser(board.id, user.id) : null;
    voteAggregate = user && board && userVote ? await getCommunityVoteAggregate(board.id) : null;
  } catch (error) {
    if (isMissingCommunityTableError(error)) {
      setupMessage =
        "Community module tables are missing. Apply the migration `supabase/migrations/20260416_add_community_module.sql` to enable this page.";
    } else {
      throw error;
    }
  }

  return (
    <div className="space-y-6 pt-28 md:space-y-8 md:pt-32">
      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap">
          <div className="inner-hero rounded-[28px] px-5 py-7 md:rounded-[36px] md:px-10 md:py-10">
            <p className="section-kicker">Community Arena</p>
            <h1 className="section-title">One featured live board. One vote per account.</h1>
            <p className="section-copy">
              This section is for community predictions only. Once you submit your vote for the current board,
              your picks are final.
            </p>
          </div>
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
          <CommunityClient user={user} board={board} userVote={userVote} voteAggregate={voteAggregate} />
        </div>
      </section>
    </div>
  );
}
