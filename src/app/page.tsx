import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import { formatPrize, getMajorWins } from "@/data/helpers";
import Link from "next/link";
import dynamic from "next/dynamic";

const EraTimeline = dynamic(() => import("@/components/timeline/EraTimeline"), { ssr: true });
const TrophyRoom = dynamic(() => import("@/components/trophy/TrophyRoom"), { ssr: true });

export default function HomePage() {
  const featuredWins = getMajorWins().slice(0, 3);

  return (
    <div className="archive-shell">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />

        <section className="archive-section">
          <div className="page-wrap">
            <div className="section-head flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-kicker">Achievements</p>
                <h2 className="section-title">The wins that built the standard</h2>
                <p className="section-copy">
                  Team SOUL&apos;s legacy is written in finishes, finals, and title-clinching runs.
                  Start with the marquee victories that shaped the brand.
                </p>
              </div>
              <Link href="/tournaments" className="button-secondary w-fit">
                Explore All Results
              </Link>
            </div>

            <div className="results-grid">
              {featuredWins.map((item, index) => (
                <article
                  key={item.id}
                  className={`home-achievement-card rounded-[24px] p-6 ${
                    index === 0 ? "featured-span md:p-8" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="section-kicker mb-3">{item.year}</p>
                      <h3 className="font-display text-4xl uppercase leading-[0.92] tracking-[0.02em] text-white md:text-5xl">
                        {item.name}
                      </h3>
                    </div>
                    <span className="tag tag-won">Champion</span>
                  </div>

                  <div className="mt-8 grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                        Placement
                      </p>
                      <p className="mt-2 font-display text-5xl uppercase leading-none text-energy">
                        {item.placement}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                        Approx prize
                      </p>
                      <p className="mt-2 font-display text-4xl uppercase leading-none text-white">
                        {formatPrize(item.prize)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <EraTimeline />
        <TrophyRoom />
      </main>
      <Footer />
    </div>
  );
}
