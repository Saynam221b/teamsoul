"use client";

import Link from "next/link";
import { finalCtaContent } from "@/data/presentation";

export default function Footer() {
  return (
    <footer className="mt-auto bg-transparent">
      <section className="page-wrap py-16">
        <div className="footer-callout px-6 py-8 md:px-10 md:py-10">
          <p className="section-kicker">{finalCtaContent.eyebrow}</p>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="section-title">{finalCtaContent.title}</h2>
              <p className="section-copy">{finalCtaContent.description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={finalCtaContent.primaryCta.href} className="button-primary">
                {finalCtaContent.primaryCta.label}
              </Link>
              <Link href={finalCtaContent.secondaryCta.href} className="button-secondary">
                {finalCtaContent.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-8 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p className="uppercase tracking-[0.2em]">Team SOUL</p>
          <p>Bharat Ki Sarvashreshth Team, Team SOUL</p>
        </div>
      </section>
    </footer>
  );
}
