import type { Metadata } from "next";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
import RecentChangesSection from "@/components/home/RecentChangesSection";
import VerificationSummaryPanel from "@/components/shared/VerificationSummaryPanel";
import {
  getEntityVerificationSummary,
  getRecentApprovedChanges,
  getSourceReferenceById,
  getSourceById,
  getUpdateCandidates,
} from "@/lib/sourceTruth";

export const metadata: Metadata = {
  title: "Updates — Team SOUL HQ",
  description:
    "Approved Team SouL archive changes, verification status, and source-backed watchlist items.",
};

export const dynamic = "force-dynamic";

export default function UpdatesPage() {
  const changes = getRecentApprovedChanges(12);
  const candidates = getUpdateCandidates();
  const verificationSummary = getEntityVerificationSummary("organization", "team-soul");

  return (
    <div className="updates-route relative space-y-6 overflow-hidden pt-28 md:space-y-8 md:pt-32">
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
            <p className="section-kicker">What changed</p>
            <h1 className="section-title">Team SouL HQ updates</h1>
            <p className="section-copy">
              This feed separates approved public truth from watchlist items. If a change is not verified,
              it does not enter the canonical archive.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="archive-section !pt-0 !pb-0">
        <div className="page-wrap">
          <VerificationSummaryPanel
            summary={verificationSummary}
            eyebrow="System state"
            title="Approved updates, then public release"
            description="The archive now stages incoming changes through a review-minded flow instead of publishing speculative competitive data directly."
          />
        </div>
      </section>

      <RecentChangesSection
        changes={changes}
        title="Approved public changes"
        description="Only approved changes land in the HQ feed. These updates are safe to expose on home, detail pages, and canonical archive surfaces."
      />

      <section className="archive-section !pt-0">
        <div className="page-wrap">
          <RevealOnScroll className="section-head max-w-3xl">
            <p className="section-kicker">Watchlist</p>
            <h2 className="section-title">Candidates waiting for proof</h2>
            <p className="section-copy">
              These items are being tracked, but they do not shape the public archive until a trusted source confirms them.
            </p>
          </RevealOnScroll>

          <div className="updates-grid">
            {candidates.map((candidate, index) => (
              <RevealOnScroll
                key={candidate.id}
                as="article"
                delay={Math.min(index * 0.05, 0.15)}
                className="archive-panel public-card updates-card updates-card-candidate rounded-[22px] p-4 md:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="verification-reference-label">{candidate.candidateStatus}</span>
                  <span className="verification-reference-date">{candidate.proposedAt}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl uppercase leading-[0.92] text-white">
                  {candidate.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{candidate.summary}</p>

                <div className="mt-4 space-y-2">
                  {candidate.sourceReferenceIds.map((referenceId) => {
                    const reference = getSourceReferenceById(referenceId);
                    const source = reference ? getSourceById(reference.sourceId) : null;
                    if (!reference) return null;

                    return (
                      <p key={referenceId} className="text-xs leading-6 text-text-secondary">
                        {source?.name ?? reference.sourceId}: {reference.title}
                      </p>
                    );
                  })}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
