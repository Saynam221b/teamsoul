import HeroSection from "@/components/hero/HeroSection";
import dynamicImport from "next/dynamic";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import { getArchiveFeedUnavailableMessage, getPublicArchiveFeed } from "@/lib/db/archive";
import { getPublicTournamentFeed, getTournamentFeedUnavailableMessage } from "@/lib/db/tournaments";
import TrophyRoom from "@/components/trophy/TrophyRoom";

const EraTimeline = dynamicImport(() => import("@/components/timeline/EraTimeline"), { ssr: true });
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const archiveFeed = await getPublicArchiveFeed();
  const tournamentFeed = await getPublicTournamentFeed();
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

      <TrophyRoom
        tournaments={tournamentFeed.tournaments}
        players={archiveFeed.players}
      />
      <EraTimeline
        eras={archiveFeed.eras}
        players={archiveFeed.players}
        staff={archiveFeed.staff}
      />
    </>
  );
}
