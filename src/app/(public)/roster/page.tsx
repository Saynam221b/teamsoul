import type { Metadata } from "next";
import DataFallbackNotice from "@/components/shared/DataFallbackNotice";
import { getArchiveFeedUnavailableMessage, getPublicArchiveFeed } from "@/lib/db/archive";
import { getYearFromDateString } from "@/data/helpers";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import PlayerGrid from "@/components/roster/PlayerGrid";

export const metadata: Metadata = {
  title: "Roster — Team SOUL Archive",
  description:
    "Simple player history of Team SOUL, with lineup changes, roles, and key eras.",
};
export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const archiveFeed = await getPublicArchiveFeed();
  const players = archiveFeed.players;
  const totalPlayers = players.length;
  const activePlayers = players.filter((player) => player.currentStatus === "active").length;
  const founders = players.filter((player) => player.isFounder).length;
  const awardsTracked = players.reduce((sum, player) => sum + player.awards.length, 0);
  const years = players.flatMap((player) =>
    player.stints.flatMap((stint) => {
      const joinYear = getYearFromDateString(stint.joinDate);
      const leaveYear = stint.leaveDate ? getYearFromDateString(stint.leaveDate) : joinYear;
      return [joinYear, leaveYear];
    })
  );
  const firstYear = years.length ? Math.min(...years) : null;
  const latestYear = years.length ? Math.max(...years) : null;
  const unavailableMessages =
    archiveFeed.source === "unavailable"
      ? [getArchiveFeedUnavailableMessage(archiveFeed.message)]
      : [];

  return (
    <div className="space-y-6 pt-28 md:space-y-8 md:pt-32">
        {unavailableMessages.length > 0 ? (
          <section className="archive-section !pt-0 !pb-0">
            <div className="page-wrap">
              <DataFallbackNotice messages={unavailableMessages} />
            </div>
          </section>
        ) : null}

        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <RevealOnScroll as="div" className="inner-hero rounded-[28px] px-5 py-7 md:rounded-[36px] md:px-10 md:py-10" intensity="hero">
              <div className="flex flex-col gap-6 md:gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <p className="section-kicker">Roster archive</p>
                  <h1 className="section-title">The lineup story behind the dynasty</h1>
                  <p className="section-copy">
                    The roster page should feel like a hall of names and impact, not a stack of generic
                    profile cards. This route leads with the scale of the system, then lets the filters do the work.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 xl:max-w-[360px] xl:justify-end">
                  <span className="hero-chip">
                    {firstYear && latestYear ? `${firstYear}-${latestYear} covered` : "No roster years available"}
                  </span>
                  <span className="hero-chip">{awardsTracked} awards tracked</span>
                </div>
              </div>

              <div className="section-divider mt-5 md:mt-8" />

              <div className="hero-stat-grid mt-5 md:mt-8">
                <article className="hero-stat-card">
                  <p className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                    {totalPlayers}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-2xl uppercase leading-none text-accent md:text-4xl">
                    {activePlayers}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-2xl uppercase leading-none text-gold md:text-4xl">
                    {founders}
                  </p>
                </article>
                <article className="hero-stat-card">
                  <p className="font-display text-2xl uppercase leading-none text-white md:text-4xl">
                    {awardsTracked}
                  </p>
                </article>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <RevealOnScroll as="div" className="archive-panel public-card rounded-[20px] p-4 md:rounded-[28px] md:p-7" delay={0.04}>
                <p className="section-kicker">Roster signal</p>
                <h2 className="font-display text-xl uppercase leading-none text-white md:text-3xl">
                  Built to track movement
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Search, status, and era filters stay visible so users can move from founder-era names to
                  current players without losing context.
                </p>
              </RevealOnScroll>

              <RevealOnScroll as="div" className="archive-panel public-card rounded-[20px] p-4 md:rounded-[28px] md:p-7" delay={0.1}>
                <p className="section-kicker">Identity check</p>
                <p className="font-display text-xl uppercase leading-none text-white md:text-3xl">
                  Names first. Impact second.
                </p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Each player card still carries the role, timeline, and awards, but the page now opens with the
                  larger roster story so it feels closer to the homepage language.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="archive-section !pt-0 !pb-0">
          <div className="page-wrap">
            <PlayerGrid players={archiveFeed.players} eras={archiveFeed.eras} />
          </div>
        </section>
    </div>
  );
}
