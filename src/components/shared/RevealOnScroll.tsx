"use client";

import { useRef } from "react";
import { motion, useInView, type UseInViewOptions } from "framer-motion";

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
}

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  distance = 30,
  margin = "-80px",
  as = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: margin as UseInViewOptions["margin"] });

  const Tag = motion[as];

  return (
    <Tag
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}
