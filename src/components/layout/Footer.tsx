"use client";

import { finalCtaContent } from "@/data/presentation";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

export default function Footer() {
  return (
    <footer className="footer-shell mt-auto bg-transparent">
      <div className="footer-kinetic-layers" aria-hidden="true">
        <span className="footer-orb footer-orb-cyan" />
        <span className="footer-orb footer-orb-gold" />
        <span className="footer-grid" />
      </div>
      <section className="page-wrap pt-16 pb-12 md:pt-[5.5rem] md:pb-[4.5rem]">
        <RevealOnScroll
          className="footer-legacy-grid footer-callout grid gap-8 py-8 text-sm text-text-muted md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
          intensity="hero"
        >
          <div className="footer-legacy-copy max-w-xl">
            <p className="section-kicker">{finalCtaContent.eyebrow}</p>
            <div className="flex flex-col gap-2">
              <h2 className="section-title">{finalCtaContent.title}</h2>
              <p className="section-copy">{finalCtaContent.description}</p>
            </div>
          </div>

          <div className="footer-meta flex flex-col gap-6 md:items-end">
            <div className="flex flex-col gap-2 text-left md:text-right">
              <p className="footer-identity-title">TEAM SOUL</p>
              <p className="footer-identity-sub">Bharat Ki Sarvashreshth Team</p>
            </div>

            <div className="flex flex-col items-start gap-4 text-left md:items-end md:text-right">
              <p className="footer-credit-line inline-flex items-center gap-1.5">
                <span>Built with</span>
                <span className="text-red-500">❤️</span>
                <span>by D3xTRverse</span>
              </p>
              <a
                href="https://saynam-portfolio-19qy.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-creator-link inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors hover:border-accent/20 hover:bg-white/[0.08] hover:text-white"
              >
                Meet the creator
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </footer>
  );
}
