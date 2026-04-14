import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getTournamentsFromDb } from "@/lib/db/tournaments";
import { formatPrize } from "@/data/helpers";
import dynamic from "next/dynamic";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

const TournamentDash = dynamic(() => import("@/components/tournaments/TournamentDash"), { ssr: true });

export const metadata: Metadata = {
  title: "Tournament History — Team SOUL Archive",
  description:
    "Simple tournament history of Team SOUL with placements, status, and approx price details.",
};

export default async function TournamentsPage() {
  const tournaments = await getTournamentsFromDb();
  const ongoing = tournaments.filter((item) => item.status === "live");
  const completed = tournaments.filter(
    (item) => item.status !== "upcoming" && item.status !== "live"
  );
  const wins = completed.filter((item) => item.isWin);
  const upcoming = tournaments.filter((item) => item.status === "upcoming");
  const totalPrize = completed.reduce((sum, item) => sum + (item.prize ?? 0), 0);
  const latestYear = completed.reduce((latest, item) => Math.max(latest, item.year), 0);

  return (
    <div className="archive-shell">
      <Navbar />
      <main id="main-content" className="flex-1 pt-28 md:pt-32 space-y-6 md:space-y-8">
        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <RevealOnScroll as="div" className="inner-hero rounded-[28px] px-5 py-7 md:rounded-[36px] md:px-10 md:py-10" intensity="hero">
              <div className="flex flex-col gap-6 md:gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="section-kicker">Tournament archive</p>
                  <h1 className="section-title">Every campaign, every final table, one live command board</h1>
                  <p className="section-copy">
                    Team SOUL&apos;s tournament history should scan like a flagship archive, not a dump of
                    records. This page leads with the scale of the run, then drops straight into filters and results.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 xl:max-w-[360px] xl:justify-end">
                  <span className="hero-chip">Tracked through {latestYear || "today"}</span>
                  <span className="hero-chip">{ongoing.length} ongoing right now</span>
                  <span className="hero-chip">{upcoming.length} upcoming event{upcoming.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="section-divider mt-5 md:mt-8" />

              <div className="hero-stat-grid mt-5 md:mt-8">
                <article className="hero-stat-card">
                  <p className="font-display text-3xl uppercase leading-none text-white md:text-6xl">
                    {completed.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-3xl uppercase leading-none text-accent md:text-6xl">
                    {wins.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-[clamp(1.125rem,2.5vw,2.4rem)] uppercase leading-none text-white">
                    {formatPrize(totalPrize)}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-3xl uppercase leading-none text-energy md:text-6xl">
                    {ongoing.length}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-3xl uppercase leading-none text-gold md:text-6xl">
                    {upcoming.length}
                  </p>
                </article>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <RevealOnScroll as="div" className="archive-panel public-card rounded-[20px] p-4 md:rounded-[28px] md:p-7" delay={0.04}>
                <p className="section-kicker">Archive signal</p>
                <h2 className="font-display text-2xl uppercase leading-none text-white md:text-5xl">
                  Scan fast, then go deep
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                  Recent users should understand immediately what this page is for: live schedule on top,
                  championship cuts first, then every result grouped however they want to inspect it.
                </p>
              </RevealOnScroll>

              <RevealOnScroll as="div" className="archive-panel public-card rounded-[20px] p-4 md:rounded-[28px] md:p-7" delay={0.1}>
                <p className="section-kicker">Best return</p>
                <p className="font-display text-3xl uppercase leading-none text-white md:text-6xl">
                  {wins[0]?.year ?? "—"}
                </p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  The archive keeps the biggest wins visible first so the page still feels like Team SOUL,
                  even when someone arrives here only to search one event.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <TournamentDash tournaments={tournaments} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
