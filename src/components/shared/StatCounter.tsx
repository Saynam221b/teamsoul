"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
}

export default function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  duration = 2,
  className = "",
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={`text-center ${className}`}
    >
      <div className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
        {prefix}
        {displayValue.toLocaleString("en-US")}
        {suffix}
      </div>
      <div className="mt-1.5 text-xs text-text-muted uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}
