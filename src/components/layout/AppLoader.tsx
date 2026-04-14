"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM, MOTION_TIMINGS } from "@/lib/motion";

const SESSION_KEY = "team_soul_loader_seen";

export default function AppLoader() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSeen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    if (hasSeen) return;

    const showTimer = window.setTimeout(() => {
      setVisible(true);
    }, 0);

    const exitDelay = prefersReducedMotion ? 900 : 2550;
    const removeDelay = prefersReducedMotion ? 1250 : 3200;

    const exitTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setExiting(true);
    }, exitDelay);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, removeDelay);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? MOTION_TIMINGS.fast : MOTION_TIMINGS.slow, ease: EASE_PREMIUM }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-6"
          style={{ backgroundColor: "#050912" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_38%,rgba(255,255,255,0.03))]" />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={
                exiting
                  ? { opacity: 0, y: prefersReducedMotion ? 0 : -8 }
                  : prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: [0.72, 1, 0.78], y: 0 }
              }
              transition={
                exiting
                  ? { duration: MOTION_TIMINGS.base, ease: EASE_PREMIUM }
                  : prefersReducedMotion
                    ? { duration: MOTION_TIMINGS.fast }
                    : {
                        duration: 2.4,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "mirror",
                      }
              }
              className="font-display text-[3.8rem] uppercase leading-[0.88] tracking-[-0.06em] text-white sm:text-[5.2rem] md:text-[7rem]"
            >
              Team SOUL
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={exiting ? { opacity: 0 } : { opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? MOTION_TIMINGS.fast : MOTION_TIMINGS.reveal,
                delay: prefersReducedMotion ? 0 : 0.22,
                ease: EASE_PREMIUM,
              }}
              className="mt-4 text-[11px] uppercase tracking-[0.34em] text-text-secondary sm:text-xs md:mt-5 md:tracking-[0.48em]"
            >
              Bharat Ki Sarvashreshth Team
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={exiting ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? MOTION_TIMINGS.fast : 1.1,
                delay: prefersReducedMotion ? 0 : 0.16,
                ease: EASE_PREMIUM,
              }}
              className="mt-8 h-px w-32 origin-center bg-[linear-gradient(90deg,transparent,rgba(0,229,255,0.72),transparent)] md:w-44"
            />

            <motion.div
              initial={{ scaleX: 0 }}
              animate={exiting ? { scaleX: 1 } : { scaleX: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.9 : 2.75,
                ease: EASE_PREMIUM,
              }}
              className="mt-10 h-[2px] w-full max-w-sm origin-left overflow-hidden rounded-full bg-white/8"
            >
              <motion.span
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                  duration: prefersReducedMotion ? 0.9 : 2.75,
                  ease: EASE_PREMIUM,
                }}
                className="block h-full w-full bg-[linear-gradient(90deg,rgba(0,229,255,0.14),rgba(0,229,255,0.85),rgba(255,255,255,0.4))]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
