import type { Metadata } from "next";
import Image from "next/image";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import HighlightGallery from "@/components/champions/HighlightGallery";
import { getArchiveFeedUnavailableMessage, getPublicArchiveFeed } from "@/lib/db/archive";
import { getPublicBlobAssetFeed, getBlobAssetFeedUnavailableMessage } from "@/lib/db/blobAssets";
import { getBgisHighlights, getChampionPlayers, getChampionStaff } from "@/lib/bgis";

export const metadata: Metadata = {
  title: "BGIS Champions — Team SOUL Archive",
  description:
    "Team SOUL BGIS 2026 championship gallery with roster photos and highlights.",
};
export const dynamic = "force-dynamic";

export default async function BgisChampionsPage() {
  const archiveFeed = await getPublicArchiveFeed();
  const blobAssetFeed = await getPublicBlobAssetFeed();
  const players = getChampionPlayers(archiveFeed.players, blobAssetFeed.assets);
  const staff = getChampionStaff(archiveFeed.staff, blobAssetFeed.assets);
  const highlights = getBgisHighlights(blobAssetFeed.assets);
  const assetStats = {
    generatedAt: blobAssetFeed.generatedAt,
    totalFiles: blobAssetFeed.totalFiles,
  };
  const unavailableMessages = [
    archiveFeed.source === "unavailable"
      ? getArchiveFeedUnavailableMessage(archiveFeed.message)
      : null,
    blobAssetFeed.source === "unavailable"
      ? getBlobAssetFeedUnavailableMessage(blobAssetFeed.message)
      : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="champions-route relative overflow-hidden pt-28 md:pt-32">
        <div className="route-kinetic-layers" aria-hidden="true">
          <span className="route-kinetic-glow route-kinetic-glow-cyan" />
          <span className="route-kinetic-glow route-kinetic-glow-gold" />
          <span className="route-kinetic-lines" />
        </div>
        <section className="archive-section !pt-0">
          <div className="page-wrap space-y-6">
            {unavailableMessages.length > 0 ? (
              <DataFallbackNotice messages={unavailableMessages} />
            ) : null}

            <RevealOnScroll as="section" className="inner-hero route-hero route-hero-champions rounded-[36px] px-5 py-7 md:px-10 md:py-10" intensity="hero">
              <span className="route-hero-sweep" aria-hidden="true" />
              <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="section-kicker">BGIS 2026</p>
                  <h1 className="section-title">Champions gallery</h1>
                  <p className="section-copy">
                    The title story is not only the five on stage. This page now keeps the portraits,
                    highlight frames, and the coaching context together so the 2026 championship reads like
                    a complete setup.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 xl:max-w-[360px] xl:justify-end">
                  <span className="hero-chip">{players.length} player portraits</span>
                  <span className="hero-chip">
                    {staff.length} staff / {highlights.length} highlight frames
                  </span>
                </div>
              </div>

              <div className="section-divider mt-8" />

              <div className="hero-stat-grid mt-8">
                <article className="hero-stat-card">
                  <p className="section-label">Blob assets loaded</p>
                  <p className="font-display text-3xl uppercase leading-none text-white md:text-4xl">
                    {assetStats.totalFiles}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="section-label">Champion roster</p>
                  <p className="font-display text-3xl uppercase leading-none text-accent md:text-4xl">
                    {players.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="section-label">Support staff</p>
                  <p className="font-display text-3xl uppercase leading-none text-gold md:text-4xl">
                    {staff.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="section-label">Last sync</p>
                  <p className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                    {assetStats.generatedAt
                      ? new Date(assetStats.generatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Pending"}
                  </p>
                </article>
              </div>
            </RevealOnScroll>

            <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <RevealOnScroll as="div" className="archive-panel public-card route-info-panel rounded-[28px] p-6 md:p-7" delay={0.04}>
                <p className="section-kicker">Championship setup</p>
                <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                  Manya and NakuL reset the era. Ayogi stayed through the title phase.
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  The modern run opens with the 2024 ex-Blind core acquisition around Manya and NakuL.
                  Later roster changes hardened into the BGIS 2026 five, with Ayogi still in the coaching
                  lane as the structure stabilized.
                </p>
              </RevealOnScroll>

              <RevealOnScroll as="div" className="archive-panel public-card route-info-panel rounded-[28px] p-6 md:p-7" delay={0.1}>
                <p className="section-kicker">Support lane</p>
                <p className="mt-1 text-sm leading-7 text-text-secondary">
                  Soul Ayogi remains attached to the modern chapter as coach, so the gallery now separates
                  the player five from the staff context instead of implying the title run was player-only.
                </p>
              </RevealOnScroll>
            </section>

            <RevealOnScroll as="section" className="archive-panel public-card route-live-panel rounded-[32px] p-6 md:p-8" delay={0.12}>
              <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="public-card-accent public-card-accent-highlight rounded-[24px] border border-white/8 bg-white/[0.02] p-5 md:p-6">
                  <p className="section-kicker">Championship context</p>
                  <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                    The visible five for BGIS 2026 were NakuL, Goblin, LEGIT, Jokerr, and Thunder. Behind
                    them, Ayogi stayed with the modern structure from the rebuild period into the title
                    finish, giving the roster a continuous coaching line after the Manya-led acquisition.
                  </p>
                </div>

                {staff.map((member) => (
                  <article
                    key={member.id}
                    className="public-card route-card-chromatic overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.02]"
                  >
                    <div className="relative aspect-[5/4] bg-black/35">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={`${member.displayName} portrait`}
                          fill
                          className="object-contain object-top"
                          sizes="(max-width: 1024px) 100vw, 28vw"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-text-muted">
                          Image not mapped
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Coach</p>
                      <h3 className="mt-2 font-display text-2xl uppercase leading-none text-white">
                        {member.displayName}
                      </h3>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                        {member.role}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                  Title-winning five
                </h2>
                <span className="rounded-full border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  2026 core
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {players.map((player) => (
                  <article
                    key={player.id}
                    className="public-card route-card-chromatic overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.02]"
                  >
                    <div className="relative aspect-[4/5] bg-black/35">
                      {player.image ? (
                        <Image
                          src={player.image}
                          alt={`${player.displayName} portrait`}
                          fill
                          className="object-contain object-top"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 20vw"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-text-muted">
                          Image not mapped
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-2xl uppercase leading-none text-white">
                        {player.displayName}
                      </h3>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                        {player.role}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-text-secondary">{player.impact}</p>
                    </div>
                  </article>
                  ))}
                </div>
            </RevealOnScroll>

            <RevealOnScroll as="section" className="archive-panel public-card route-live-panel rounded-[32px] p-6 md:p-8" delay={0.16}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                  Highlight frames
                </h2>
                <span className="text-xs uppercase tracking-[0.18em] text-text-muted">
                  {highlights.length} images
                </span>
              </div>

              {highlights.length > 0 ? (
                <HighlightGallery highlights={highlights} />
              ) : (
                <p className="text-sm leading-7 text-text-muted">
                  No highlight assets found yet. Run <code>npm run upload:bgmi-assets</code>.
                </p>
              )}
            </RevealOnScroll>
          </div>
        </section>
    </div>
  );
}
