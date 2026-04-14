"use client";

import Link from "next/link";
import { finalCtaContent } from "@/data/presentation";
import RevealOnScroll from "@/components/shared/RevealOnScroll";

export default function Footer() {
  return (
    <footer className="mt-auto bg-transparent">
      <section className="page-wrap pt-16 pb-12 md:pt-[5.5rem] md:pb-[4.5rem]">
        <RevealOnScroll className="footer-callout footer-callout-compact px-5 py-6 md:px-8 md:py-7" intensity="hero">
          <p className="section-kicker">{finalCtaContent.eyebrow}</p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="section-title">{finalCtaContent.title}</h2>
              <p className="section-copy">{finalCtaContent.description}</p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link href={finalCtaContent.primaryCta.href} className="button-primary">
                {finalCtaContent.primaryCta.label}
              </Link>
              <Link href={finalCtaContent.secondaryCta.href} className="button-secondary">
                {finalCtaContent.secondaryCta.label}
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="flex flex-col gap-6 py-8 text-sm text-text-muted md:flex-row md:items-center md:justify-between" delay={0.08} distance={16}>
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
        </RevealOnScroll>
      </section>
    </footer>
  );
}
