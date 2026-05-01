import HeroSection from "@/components/hero/HeroSection";
import dynamicImport from "next/dynamic";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import RecentChangesSection from "@/components/home/RecentChangesSection";
import VerificationSummaryPanel from "@/components/shared/VerificationSummaryPanel";
import { getArchiveFeedUnavailableMessage, getPublicArchiveFeed } from "@/lib/db/archive";
import { getPublicTournamentFeed, getTournamentFeedUnavailableMessage } from "@/lib/db/tournaments";
import {
  getCanonicalTournaments,
  getEntityVerificationSummary,
  getRecentApprovedChanges,
  mergePlayerTruth,
  mergeStaffTruth,
  mergeTournamentTruth,
} from "@/lib/sourceTruth";
import TrophyRoom from "@/components/trophy/TrophyRoom";

const EraTimeline = dynamicImport(() => import("@/components/timeline/EraTimeline"), { ssr: true });
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const archiveFeed = await getPublicArchiveFeed();
  const tournamentFeed = await getPublicTournamentFeed();
  const verifiedPlayers = mergePlayerTruth(archiveFeed.players);
  const verifiedStaff = mergeStaffTruth(archiveFeed.staff);
  const verifiedTournaments = mergeTournamentTruth(tournamentFeed.tournaments);
  const canonicalTournaments = getCanonicalTournaments(verifiedTournaments);
  const recentChanges = getRecentApprovedChanges(4);
  const organizationVerification = getEntityVerificationSummary("organization", "team-soul");
  const unavailableMessages = [
    archiveFeed.source === "unavailable"
      ? getArchiveFeedUnavailableMessage(archiveFeed.message)
      : null,
    tournamentFeed.source === "unavailable"
      ? getTournamentFeedUnavailableMessage(tournamentFeed.message)
      : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <>
      <HeroSection organization={archiveFeed.organization} stats={archiveFeed.stats} />

      {unavailableMessages.length > 0 ? (
        <section className="archive-section !pt-4 !pb-0">
          <div className="page-wrap">
            <DataFallbackNotice messages={unavailableMessages} />
          </div>
        </section>
      ) : null}

      <section className="archive-section !pt-4 !pb-0">
        <div className="page-wrap">
          <VerificationSummaryPanel
            summary={organizationVerification}
            eyebrow="Archive trust"
            title="Verified Team SouL HQ"
            description="The HQ layer now separates confirmed public truth from watchlist items. Canonical archive surfaces only show verified records."
          />
        </div>
      </section>

      <RecentChangesSection changes={recentChanges} />

      <TrophyRoom
        tournaments={canonicalTournaments}
        players={verifiedPlayers}
      />
      <EraTimeline
        eras={archiveFeed.eras}
        players={verifiedPlayers}
        staff={verifiedStaff}
      />
    </>
  );
}
