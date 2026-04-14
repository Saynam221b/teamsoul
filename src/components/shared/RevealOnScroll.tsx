"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type UseInViewOptions } from "framer-motion";
import { EASE_PREMIUM, MOTION_TIMINGS } from "@/lib/motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds, useful for items in a grid */
  delay?: number;
  /** Distance to travel upward in px */
  distance?: number;
  /** IntersectionObserver rootMargin */
  margin?: string;
  /** HTML tag to render */
  as?: "div" | "section" | "article" | "footer" | "header";
  intensity?: "soft" | "medium" | "hero";
}

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  distance = 30,
  margin = "-80px",
  as = "div",
  intensity = "medium",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: margin as UseInViewOptions["margin"] });

  const Tag = motion[as];
  const resolvedDistance =
    prefersReducedMotion ? 0 : intensity === "soft" ? Math.min(distance, 18) : intensity === "hero" ? Math.max(distance, 36) : distance;
  const resolvedDuration =
    prefersReducedMotion ? MOTION_TIMINGS.fast : intensity === "soft" ? 0.42 : intensity === "hero" ? 0.68 : MOTION_TIMINGS.reveal;

  return (
    <Tag
      ref={ref}
      initial={{ opacity: 0, y: resolvedDistance }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: resolvedDistance }}
      transition={{
        duration: resolvedDuration,
        delay,
        ease: EASE_PREMIUM,
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}
