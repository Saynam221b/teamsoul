"use client";

import { finalCtaContent } from "@/data/presentation";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

export default function Footer() {
  return (
    <footer className="mt-auto bg-transparent">
      <section className="page-wrap pt-16 pb-12 md:pt-[5.5rem] md:pb-[4.5rem]">
        <RevealOnScroll
          className="footer-legacy-grid flex flex-col gap-8 py-8 text-sm text-text-muted md:flex-row md:items-end md:justify-between"
          intensity="hero"
        >
          <div className="footer-legacy-copy max-w-xl">
            <p className="section-kicker">{finalCtaContent.eyebrow}</p>
            <div className="flex flex-col gap-2">
              <h2 className="section-title">{finalCtaContent.title}</h2>
              <p className="section-copy">{finalCtaContent.description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:items-end">
            <div className="flex flex-col gap-2">
              <p className="uppercase tracking-[0.2em] font-semibold text-white">Team SOUL</p>
              <p>Bharat Ki Sarvashreshth Team</p>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <p className="flex items-center gap-1.5">
                Built with <span className="text-red-500">❤️</span> by D3xTRverse
              </p>
              <a
                href="https://saynam-portfolio-19qy.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors hover:border-accent/20 hover:bg-white/[0.08] hover:text-white"
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
