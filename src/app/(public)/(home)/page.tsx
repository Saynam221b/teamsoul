import HeroSection from "@/components/hero/HeroSection";
import dynamic from "next/dynamic";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import { getArchiveFeedFallbackMessage, getPublicArchiveFeed } from "@/lib/db/archive";
import { getPublicTournamentFeed } from "@/lib/db/tournaments";
import TrophyRoom from "@/components/trophy/TrophyRoom";
import { getTournamentFeedFallbackMessage } from "@/lib/db/tournaments";

const EraTimeline = dynamic(() => import("@/components/timeline/EraTimeline"), { ssr: true });

export default async function HomePage() {
  const archiveFeed = await getPublicArchiveFeed();
  const tournamentFeed = await getPublicTournamentFeed();
  const fallbackMessages = [
    archiveFeed.source === "fallback"
      ? getArchiveFeedFallbackMessage(archiveFeed.degradedReason)
      : null,
    tournamentFeed.source === "fallback"
      ? getTournamentFeedFallbackMessage(tournamentFeed.degradedReason)
      : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <>
      <HeroSection organization={archiveFeed.organization} stats={archiveFeed.stats} />

      {fallbackMessages.length > 0 ? (
        <section className="archive-section !pt-4 !pb-0">
          <div className="page-wrap">
            <DataFallbackNotice messages={fallbackMessages} />
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
