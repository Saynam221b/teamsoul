import Image from "next/image";
import type { AggregateStats, Organization } from "@/data/types";
import { homeHeroContent } from "@/data/presentation";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import RouteLink from "@/components/layout/RouteLink";

const heroStats = (org: Organization, wins: number) => [
  { label: "Major wins", value: wins.toString().padStart(2, "0") },
  { label: "Tournaments tracked", value: org.totalTournaments.toString() },
  { label: "Peak viewers", value: org.peakViewership.toLocaleString("en-US") },
  { label: "Approx earnings", value: `$${org.totalEarnings.toLocaleString("en-US")}` },
];

interface HeroSectionProps {
  organization: Organization;
  stats: AggregateStats;
}

export default function HeroSection({ organization, stats }: HeroSectionProps) {
  const marqueeStats = heroStats(organization, stats.totalWins);

  return (
    <section className="hero-section relative overflow-hidden pt-24 md:pt-32">
      <div className="hero-kinetic-layers" aria-hidden="true">
        <span className="hero-orb hero-orb-cyan" />
        <span className="hero-orb hero-orb-energy" />
        <span className="hero-orb hero-orb-gold" />
        <span className="hero-grid-sweep" />
      </div>
      <div className="page-wrap">
        <div className="hero-stage relative px-4 pb-7 pt-6 md:px-5 md:pb-8 md:pt-8 lg:px-6 lg:pb-10 lg:pt-10">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(232,234,237,0.045),transparent_34%,transparent_70%,rgba(0,229,255,0.05))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]" />
          </div>

          <div className="relative z-10 flex flex-col gap-8 md:gap-12">
            <div className="grid gap-7 md:gap-10 xl:gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <RevealOnScroll distance={24} margin="-20px" intensity="hero">
                <div className="max-w-3xl">
                  <span className="eyebrow-pill">{homeHeroContent.eyebrow}</span>
                  <h1 className="hero-title hero-title-kinetic mt-6 font-display uppercase text-white">
                    Team Soul
                    <span className="hero-tagline mt-3 block text-text-secondary">
                      {homeHeroContent.title}
                    </span>
                  </h1>
                  <p className="hero-copy mt-5 max-w-2xl text-text-secondary md:text-[1.05rem]">
                    {homeHeroContent.description}
                  </p>

                  <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                    <RouteLink
                      href={homeHeroContent.primaryCta.href}
                      className="button-primary"
                      prefetch={true}
                    >
                      {homeHeroContent.primaryCta.label}
                    </RouteLink>
                    <RouteLink
                      href={homeHeroContent.secondaryCta.href}
                      className="button-secondary"
                      prefetch={true}
                    >
                      {homeHeroContent.secondaryCta.label}
                    </RouteLink>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.1} distance={24} margin="-20px" intensity="hero">
                <div className="flex flex-col justify-end gap-4 md:gap-6 xl:gap-7 lg:pl-8">
                  <div className="hero-highlight relative overflow-hidden">
                    <span className="hero-highlight-sweep" aria-hidden="true" />
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),transparent_38%,rgba(255,255,255,0.015))]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,229,255,0.35),transparent)]" />

                    <div className="relative z-10 flex min-h-[220px] flex-col justify-between p-4 md:min-h-[300px] md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.26em] text-accent">
                            Featured Championship
                          </p>
                          <h2 className="mt-3 max-w-sm font-display text-3xl uppercase leading-[0.92] text-white md:text-4xl">
                            BGIS 2026 Grand Finals
                          </h2>
                        </div>
                        <div className="hero-badge">
                          <span>Champion</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-6">
                        <div className="max-w-sm">
                          <p className="text-sm leading-7 text-text-secondary">
                            The newest crown in Team SOUL&apos;s story. A modern title run built on
                            pressure, control, and championship composure.
                          </p>
                        </div>

                        <div className="hero-logo-orbit relative hidden h-28 w-28 shrink-0 md:block">
                          <Image
                            src="/logo.png"
                            alt="Team SOUL logo"
                            fill
                            sizes="112px"
                            priority
                            className="object-contain opacity-95"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="hero-note">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">
                        Legacy
                      </p>
                      <p className="mt-2 text-sm leading-7 text-text-secondary">
                        Years of elite rosters, iconic calls, and tournament-winning discipline.
                      </p>
                    </div>
                    <div className="hero-note">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">
                        Reputation
                      </p>
                      <p className="mt-2 text-sm leading-7 text-text-secondary">
                        A fan-first website that presents Team SOUL the way the audience already sees
                        them: the benchmark.
                      </p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            <RevealOnScroll delay={0.2} distance={20} margin="-20px" className="mt-1">
              <div className="stat-marquee">
                {marqueeStats.map((item) => (
                  <div key={item.label} className="stat-marquee-card">
                    <p className="font-display text-xl uppercase leading-none tracking-[0.06em] text-white md:text-3xl">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-text-muted md:mt-2 md:text-[11px] md:tracking-[0.22em]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
