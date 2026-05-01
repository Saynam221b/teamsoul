import Link from "next/link";
import type { ApprovedChange } from "@/data/types";
import { formatDate } from "@/data/helpers";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

function getChangeTone(kind: ApprovedChange["kind"]) {
  if (kind === "result") return "updates-card-result";
  if (kind === "roster") return "updates-card-roster";
  if (kind === "staff") return "updates-card-staff";
  return "updates-card-system";
}

export default function RecentChangesSection({
  changes,
  eyebrow = "What changed",
  title = "Latest verified Team SouL updates",
  description = "The HQ feed shows approved public changes only: confirmed results, roster truth resets, and archive corrections.",
}: {
  changes: ApprovedChange[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  if (changes.length === 0) return null;

  return (
    <section className="archive-section !pt-0">
      <div className="page-wrap">
        <RevealOnScroll className="section-head max-w-3xl">
          <p className="section-kicker">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
          <p className="section-copy">{description}</p>
        </RevealOnScroll>

        <div className="updates-grid">
          {changes.map((change, index) => (
            <RevealOnScroll
              key={change.id}
              as="article"
              delay={Math.min(index * 0.04, 0.16)}
              className={`archive-panel public-card updates-card ${getChangeTone(change.kind)} rounded-[22px] p-4 md:p-5`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="verification-reference-label">{change.kind}</span>
                <span className="verification-reference-date">{formatDate(change.publishedAt)}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl uppercase leading-[0.92] text-white">
                {change.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{change.summary}</p>
              <Link
                href={change.href}
                className="mt-5 inline-flex text-[11px] uppercase tracking-[0.2em] text-accent"
              >
                View detail
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
