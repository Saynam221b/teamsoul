import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getBgisHighlights, getBlobAssetStats, getChampionPlayers } from "@/data/bgisChampions";

export const metadata: Metadata = {
  title: "BGIS Champions — Team SOUL Archive",
  description:
    "Team SOUL BGIS 2026 championship gallery with roster photos and highlights.",
};

export default function BgisChampionsPage() {
  const players = getChampionPlayers();
  const highlights = getBgisHighlights();
  const assetStats = getBlobAssetStats();

  return (
    <div className="archive-shell">
      <Navbar />
      <main id="main-content" className="flex-1 pt-28 md:pt-32">
        <section className="archive-section !pt-0">
          <div className="page-wrap space-y-6">
            <section className="inner-hero rounded-[36px] px-6 py-8 md:px-10 md:py-10">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="section-kicker">BGIS 2026</p>
                  <h1 className="section-title">Champions gallery</h1>
                  <p className="section-copy">
                    This route stays the most image-led page in the archive. Portraits and highlight frames
                    carry the emotion; the surrounding UI only gives them a cleaner, stronger stage.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="hero-chip">{players.length} player portraits</span>
                  <span className="hero-chip">{highlights.length} highlight frames</span>
                </div>
              </div>

              <div className="section-divider mt-8" />

              <div className="hero-stat-grid mt-8">
                <article className="hero-stat-card">
                  <p className="section-label">Blob assets loaded</p>
                  <p className="font-display text-5xl uppercase leading-none text-white md:text-6xl">
                    {assetStats.totalFiles}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="section-label">Champion roster</p>
                  <p className="font-display text-5xl uppercase leading-none text-accent md:text-6xl">
                    {players.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="section-label">Highlight images</p>
                  <p className="font-display text-5xl uppercase leading-none text-[#f3c76a] md:text-6xl">
                    {highlights.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="section-label">Last sync</p>
                  <p className="font-display text-3xl uppercase leading-none text-white md:text-4xl">
                    {assetStats.generatedAt
                      ? new Date(assetStats.generatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Pending"}
                  </p>
                </article>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="archive-panel rounded-[28px] p-6 md:p-7">
                <p className="section-kicker">Visual note</p>
                <h2 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                  Portraits hold the page
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  This screen keeps the strongest visual hierarchy in the archive, with restrained copy and a
                  tighter split between roster portraits and celebration frames.
                </p>
              </div>

              <div className="archive-panel rounded-[28px] p-6 md:p-7">
                <p className="section-kicker">Sync status</p>
                <p className="mt-1 text-sm leading-7 text-text-secondary">
                  Blob assets loaded: {assetStats.totalFiles}
                  {assetStats.generatedAt
                    ? ` • Last sync: ${new Date(assetStats.generatedAt).toLocaleString()}`
                    : ""}
                </p>
              </div>
            </section>

            <section className="archive-panel rounded-[32px] p-6 md:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                  Champion roster
                </h2>
                <span className="rounded-full border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  2026 core
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {players.map((player) => (
                  <article
                    key={player.id}
                    className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.02]"
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
                      <h3 className="font-display text-3xl uppercase leading-none text-white">
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
            </section>

            <section className="archive-panel rounded-[32px] p-6 md:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                  Highlight frames
                </h2>
                <span className="text-xs uppercase tracking-[0.18em] text-text-muted">
                  {highlights.length} images
                </span>
              </div>

              {highlights.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                  {highlights.map((highlight) => (
                    <figure
                      key={highlight.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.02]"
                    >
                      <Image
                        src={highlight.url}
                        alt={highlight.alt}
                        fill
                        className="object-contain object-top"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-text-muted">
                  No highlight assets found yet. Run <code>npm run upload:bgmi-assets</code>.
                </p>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
