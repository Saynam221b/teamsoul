"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isCompactMotionViewport, setIsCompactMotionViewport] = useState(false);
  const isInView = useInView(ref, { once: true, margin: margin as UseInViewOptions["margin"] });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(pointer: coarse), (max-width: 820px)");
    const syncViewport = () => setIsCompactMotionViewport(media.matches);
    syncViewport();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncViewport);
      return () => media.removeEventListener("change", syncViewport);
    }

    media.addListener(syncViewport);
    return () => media.removeListener(syncViewport);
  }, []);

  const Tag = motion[as];
  const resolvedDistance =
    prefersReducedMotion
      ? 0
      : isCompactMotionViewport
        ? Math.min(distance, 12)
        : intensity === "soft"
          ? Math.min(distance, 18)
          : intensity === "hero"
            ? Math.max(distance, 36)
            : distance;
  const resolvedDuration =
    prefersReducedMotion
      ? MOTION_TIMINGS.fast
      : isCompactMotionViewport
        ? MOTION_TIMINGS.fast
        : intensity === "soft"
          ? 0.42
          : intensity === "hero"
            ? 0.68
            : MOTION_TIMINGS.reveal;
  const shouldUseHeroSpring =
    !prefersReducedMotion && !isCompactMotionViewport && intensity === "hero";

  return (
    <Tag
      ref={ref}
      initial={{ opacity: 0, y: resolvedDistance, scale: shouldUseHeroSpring ? 0.97 : 1 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: resolvedDistance, scale: shouldUseHeroSpring ? 0.97 : 1 }
      }
      transition={
        shouldUseHeroSpring
          ? {
              type: "spring",
              stiffness: 130,
              damping: 20,
              mass: 0.9,
              delay,
            }
          : {
              duration: resolvedDuration,
              delay,
              ease: EASE_PREMIUM,
            }
      }
      className={className}
    >
      {children}
    </Tag>
  );
}
