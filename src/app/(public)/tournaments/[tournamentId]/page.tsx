import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import VerificationSummaryPanel from "@/components/shared/VerificationSummaryPanel";
import { formatDate, formatPlacement, formatPrize } from "@/data/helpers";
import { getPublicArchiveFeed } from "@/lib/db/archive";
import { getPublicBlobAssetFeed } from "@/lib/db/blobAssets";
import { getPublicTournamentFeed } from "@/lib/db/tournaments";
import { getTournamentMediaCollection } from "@/lib/mediaCollections";
import { buildTournamentDetail, mergePlayerTruth, mergeTournamentTruth } from "@/lib/sourceTruth";

type TournamentPageProps = {
  params: Promise<{ tournamentId: string }>;
};

export async function generateMetadata({ params }: TournamentPageProps): Promise<Metadata> {
  const { tournamentId } = await params;
  const tournamentFeed = await getPublicTournamentFeed();
  const tournament = mergeTournamentTruth(tournamentFeed.tournaments).find(
    (entry) => entry.id === tournamentId
  );
  return {
    title: `${tournament?.name ?? tournamentId} — Team SOUL Tournaments`,
  };
}

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }: TournamentPageProps) {
  const { tournamentId } = await params;
  const [archiveFeed, tournamentFeed, blobAssetFeed] = await Promise.all([
    getPublicArchiveFeed(),
    getPublicTournamentFeed(),
    getPublicBlobAssetFeed(),
  ]);

  const players = mergePlayerTruth(archiveFeed.players);
  const tournament = mergeTournamentTruth(tournamentFeed.tournaments).find(
    (entry) => entry.id === tournamentId
  );

  if (!tournament) notFound();

  const mediaCollection = getTournamentMediaCollection(tournament.id, blobAssetFeed.assets);
  const detail = buildTournamentDetail(tournament, players, mediaCollection);

  return (
    <div className="tournaments-route relative space-y-6 overflow-hidden pt-28 md:space-y-8 md:pt-32">
      <div className="route-kinetic-layers" aria-hidden="true">
        <span className="route-kinetic-glow route-kinetic-glow-cyan" />
        <span className="route-kinetic-glow route-kinetic-glow-gold" />
        <span className="route-kinetic-lines" />
      </div>

      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap">
          <RevealOnScroll
            as="div"
            className="inner-hero route-hero rounded-[28px] px-5 py-7 md:rounded-[36px] md:px-10 md:py-10"
            intensity="hero"
          >
            <span className="route-hero-sweep" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="hero-chip">{detail.tournament.tier}</span>
              <span className="hero-chip">{detail.tournament.status ?? "completed"}</span>
              <span className="hero-chip">
                {detail.verification.lastVerifiedAt
                  ? `Verified ${formatDate(detail.verification.lastVerifiedAt)}`
                  : "Verification pending"}
              </span>
            </div>
            <h1 className="section-title mt-6">{detail.tournament.name}</h1>
            <p className="section-copy mt-5 max-w-3xl">
              {detail.tournament.details ??
                "Canonical tournament detail with verified result state, supporting roster context, and attached approved archive changes."}
            </p>

            <div className="mt-7 hero-stat-grid">
              <article className="hero-stat-card">
                <p className="section-label">Placement</p>
                <p className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                  {typeof detail.tournament.placement === "number"
                    ? formatPlacement(detail.tournament.placement)
                    : detail.tournament.placement}
                </p>
              </article>
              <article className="hero-stat-card">
                <p className="section-label">Approx prize</p>
                <p className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                  {formatPrize(detail.tournament.prize)}
                </p>
              </article>
              <article className="hero-stat-card">
                <p className="section-label">Roster slots</p>
                <p className="font-display text-2xl uppercase leading-none text-accent md:text-4xl">
                  {detail.rosterPlayers.length}
                </p>
              </article>
              <article className="hero-stat-card">
                <p className="section-label">Public updates</p>
                <p className="font-display text-2xl uppercase leading-none text-gold md:text-4xl">
                  {detail.recentChanges.length}
                </p>
              </article>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tournaments" className="button-secondary">
                Back to tournaments
              </Link>
              <Link href="/updates" className="button-primary">
                View HQ updates
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap">
          <VerificationSummaryPanel
            summary={detail.verification}
            eyebrow="Tournament verification"
            title="Source-backed tournament detail"
            description="This detail page exposes the proof layer directly: canonical status, latest verification date, and tracked source references."
          />
        </div>
      </section>

      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap grid gap-4 lg:grid-cols-[1fr_1fr]">
          <RevealOnScroll as="article" className="archive-panel public-card rounded-[24px] p-5 md:p-6">
            <p className="section-kicker">Title-winning context</p>
            <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
              Verified roster context
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {detail.rosterPlayers.length > 0 ? (
                detail.rosterPlayers.map((player) => (
                  <Link
                    key={player.id}
                    href={`/roster/${player.id}`}
                    className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-accent/25"
                  >
                    <p className="text-sm font-medium uppercase tracking-[0.08em] text-white">
                      {player.displayName}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
                      {player.role || "Player"}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-black/10 px-4 py-8 text-sm text-text-muted">
                  No verified roster mapping is attached to this tournament yet.
                </div>
              )}
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="article" className="archive-panel public-card rounded-[24px] p-5 md:p-6" delay={0.08}>
            <p className="section-kicker">Approved changes</p>
            <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
              Public HQ updates
            </h2>
            <div className="mt-5 space-y-3">
              {detail.recentChanges.length > 0 ? (
                detail.recentChanges.map((change) => (
                  <article
                    key={change.id}
                    className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="verification-reference-label">{change.kind}</span>
                      <span className="verification-reference-date">{formatDate(change.publishedAt)}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-medium text-white">{change.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-text-secondary">{change.summary}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-white/10 bg-black/10 px-4 py-8 text-sm text-text-muted">
                  No approved HQ changes are attached to this tournament yet.
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {detail.mediaCollection && detail.mediaCollection.assets.length > 0 ? (
        <section className="archive-section !pt-0">
          <div className="page-wrap">
            <RevealOnScroll as="section" className="archive-panel public-card rounded-[24px] p-5 md:p-6">
              <p className="section-kicker">Media collection</p>
              <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                {detail.mediaCollection.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                {detail.mediaCollection.description}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {detail.mediaCollection.assets.map((asset) => (
                  <article
                    key={asset.id}
                    className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03]"
                  >
                    <div className="relative aspect-[4/5] bg-black/20">
                      <Image
                        src={asset.imageUrl}
                        alt={asset.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        {asset.assetType}
                      </p>
                      <p className="mt-2 text-sm text-white">{asset.title}</p>
                    </div>
                  </article>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>
      ) : null}
    </div>
  );
}
