import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import VerificationSummaryPanel from "@/components/shared/VerificationSummaryPanel";
import { formatDate } from "@/data/helpers";
import { getPublicArchiveFeed } from "@/lib/db/archive";
import { buildPlayerProfile, mergePlayerTruth } from "@/lib/sourceTruth";

type PlayerPageProps = {
  params: Promise<{ playerId: string }>;
};

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const archiveFeed = await getPublicArchiveFeed();
  const player = mergePlayerTruth(archiveFeed.players).find((entry) => entry.id === playerId);
  return {
    title: `${player?.displayName ?? playerId} — Team SOUL Roster`,
  };
}

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const archiveFeed = await getPublicArchiveFeed();
  const player = mergePlayerTruth(archiveFeed.players).find((entry) => entry.id === playerId);

  if (!player) notFound();

  const profile = buildPlayerProfile(player);

  return (
    <div className="roster-route relative space-y-6 overflow-hidden pt-28 md:space-y-8 md:pt-32">
      <div className="route-kinetic-layers" aria-hidden="true">
        <span className="route-kinetic-glow route-kinetic-glow-cyan" />
        <span className="route-kinetic-glow route-kinetic-glow-energy" />
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
              <span className="hero-chip">{profile.player.currentStatus}</span>
              <span className="hero-chip">{profile.player.role || "Player"}</span>
              <span className="hero-chip">
                {profile.verification.lastVerifiedAt
                  ? `Verified ${formatDate(profile.verification.lastVerifiedAt)}`
                  : "Verification pending"}
              </span>
            </div>
            <h1 className="section-title mt-6">{profile.player.displayName}</h1>
            {profile.player.realName ? (
              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-accent">{profile.player.realName}</p>
            ) : null}
            <p className="section-copy mt-5 max-w-3xl">{profile.player.impact}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/roster" className="button-secondary">
                Back to roster
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
            summary={profile.verification}
            eyebrow="Player verification"
            title="Source-backed player profile"
            description="This profile only shows public facts that have been checked against tracked sources and approved into the archive."
          />
        </div>
      </section>

      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <RevealOnScroll as="article" className="archive-panel public-card rounded-[24px] p-5 md:p-6">
            <p className="section-kicker">Timeline</p>
            <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
              Roster events
            </h2>
            <div className="mt-5 space-y-3">
              {profile.rosterEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="verification-reference-label">{event.type}</span>
                    <span className="verification-reference-date">{formatDate(event.date)}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-white">{event.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">{event.description}</p>
                </article>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll as="article" className="archive-panel public-card rounded-[24px] p-5 md:p-6" delay={0.08}>
            <p className="section-kicker">Recent updates</p>
            <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
              Approved public changes
            </h2>
            <div className="mt-5 space-y-3">
              {profile.recentChanges.length > 0 ? (
                profile.recentChanges.map((change) => (
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
                  No approved HQ updates are attached to this player yet.
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
