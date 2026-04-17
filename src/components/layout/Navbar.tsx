"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM, MOTION_TIMINGS } from "@/lib/motion";
import RouteLink from "./RouteLink";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/community", label: "Community" },
  { href: "/roster", label: "Roster" },
  { href: "/bgis-champions", label: "Champions" },
];

export default function Navbar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 28);

      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100 && !menuOpen) {
        setHidden(true);
      } else if (currentScrollY < lastScrollYRef.current || currentScrollY <= 100) {
        setHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 pt-3 md:pt-4 ${hidden ? "pointer-events-none" : ""}`}>
      <motion.div
        initial={false}
        animate={{
          opacity: hidden ? 0 : 1,
          y: prefersReducedMotion ? 0 : hidden ? "-120%" : 0,
        }}
        transition={{ duration: prefersReducedMotion ? MOTION_TIMINGS.fast : MOTION_TIMINGS.base, ease: EASE_PREMIUM }}
        className={`page-wrap nav-shell flex items-center justify-between px-4 py-3 md:px-6 pointer-events-auto ${
          scrolled
            ? "nav-shell-scrolled"
            : "nav-shell-rest"
        }`}
      >
        <span className="nav-shell-ambient nav-shell-ambient-cyan" aria-hidden="true" />
        <span className="nav-shell-ambient nav-shell-ambient-gold" aria-hidden="true" />
        <span className="nav-shell-grid" aria-hidden="true" />

        <RouteLink
          href="/"
          className="nav-brand flex min-w-0 items-center gap-3"
          prefetch={true}
          pendingIndicator="off"
          onClick={() => setMenuOpen(false)}
        >
          <div className="nav-brand-mark relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image
              src="/logo.png"
              alt="Team SOUL logo"
              fill
              className="object-contain p-1.5"
              sizes="40px"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="font-display text-2xl uppercase leading-none tracking-[0.08em] text-white">
              Team Soul
            </p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
              Bharat Ki Sarvashreshth Team
            </p>
          </div>
        </RouteLink>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <RouteLink
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`nav-link inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] ${
                  active ? "nav-link-active" : ""
                }`}
              >
                {item.label}
              </RouteLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="nav-menu-trigger inline-flex h-10 items-center justify-center rounded-full px-4 text-[11px] uppercase tracking-[0.22em] text-text-primary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            transition={{ duration: prefersReducedMotion ? MOTION_TIMINGS.fast : MOTION_TIMINGS.base, ease: EASE_PREMIUM }}
            className="page-wrap nav-mobile-panel public-card mt-2 flex flex-col gap-2 p-3 md:hidden"
            id="mobile-nav-panel"
          >
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <RouteLink
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-mobile-link flex items-center justify-between rounded-[20px] px-4 py-3.5 text-sm uppercase tracking-[0.18em] ${active ? "nav-mobile-link-active" : ""}`}
                >
                  {item.label}
                </RouteLink>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
