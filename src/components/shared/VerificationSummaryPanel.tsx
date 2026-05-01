import Link from "next/link";
import type { VerificationSummary } from "@/data/types";
import { formatDate } from "@/data/helpers";
import { getSourceById } from "@/lib/sourceTruth";

function getStatusTone(status: VerificationSummary["canonicalStatus"]) {
  if (status === "confirmed") return "verification-pill-confirmed";
  if (status === "candidate") return "verification-pill-candidate";
  return "verification-pill-archived";
}

export default function VerificationSummaryPanel({
  summary,
  eyebrow = "Verification",
  title = "Source-backed archive status",
  description,
}: {
  summary: VerificationSummary;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="archive-panel public-card verification-panel rounded-[24px] p-5 md:rounded-[28px] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="section-kicker">{eyebrow}</p>
          <h2 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            {description ??
              "This surface only promotes confirmed public truth. Candidate items stay out of the canonical archive until they are verified."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`verification-pill ${getStatusTone(summary.canonicalStatus)}`}>
            {summary.canonicalStatus}
          </span>
          <span className="verification-pill verification-pill-neutral">
            {summary.sourceCount} source{summary.sourceCount === 1 ? "" : "s"}
          </span>
          <span className="verification-pill verification-pill-neutral">
            Last verified {summary.lastVerifiedAt ? formatDate(summary.lastVerifiedAt) : "pending"}
          </span>
        </div>
      </div>

      {summary.references.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {summary.references.map((reference) => {
            const source = getSourceById(reference.sourceId);
            return (
              <article
                key={reference.id}
                className="verification-reference rounded-[18px] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="verification-reference-label">{reference.sourceType}</span>
                  <span className="verification-reference-date">{formatDate(reference.verifiedAt)}</span>
                </div>
                <h3 className="mt-3 text-sm font-medium text-white">{reference.title}</h3>
                <p className="mt-2 text-xs leading-6 text-text-secondary">
                  {source?.name ?? reference.sourceId}
                  {reference.notes ? ` • ${reference.notes}` : ""}
                </p>
                <Link
                  href={reference.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-[11px] uppercase tracking-[0.18em] text-accent"
                >
                  Open source
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
