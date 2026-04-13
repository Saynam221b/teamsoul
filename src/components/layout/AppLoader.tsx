"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "team_soul_loader_seen";

export default function AppLoader() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0); // 0=initial, 1=reveal, 2=tagline/stats

  useEffect(() => {
    const hasSeen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    if (!hasSeen) {
      // Start as visible on mount
      setVisible(true);

      // Phase 1: Logo text reveals (immediate-ish)
      const p1 = window.setTimeout(() => setPhase(1), 300);
      
      // Phase 2: Tagline + stats appear (cinematic reveal)
      const p2 = window.setTimeout(() => setPhase(2), 1100);
      
      // Dismiss after 2.8s total (increased duration)
      const hide = window.setTimeout(() => {
        setVisible(false);
        window.sessionStorage.setItem(SESSION_KEY, "1");
      }, 2900);

      return () => {
        window.clearTimeout(p1);
        window.clearTimeout(p2);
        window.clearTimeout(hide);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#020305" }}
        >
          {/* Scanline / Grain Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* Ambient glow — Cinematic Diffusion */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.06), transparent 60%)",
                "radial-gradient(circle at 20% 20%, rgba(0,229,255,0.03), transparent 40%)",
                "radial-gradient(circle at 80% 80%, rgba(57,255,20,0.02), transparent 40%)",
              ].join(", "),
            }}
          />

          {/* Glitchy accent lines */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={phase >= 1 ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[40%] left-1/2 -translate-x-1/2 h-[1px] w-32 bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          />

          {/* Central content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-display text-[6rem] md:text-[10rem] uppercase leading-[0.8] tracking-[0.1em] text-white block">
                  Team
                </span>
              </motion.div>
            </div>

            <div className="overflow-hidden">
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  className="font-display text-[6rem] md:text-[10rem] uppercase leading-[0.8] tracking-[0.1em] block"
                  style={{
                    background: "linear-gradient(to bottom, #00e5ff 20%, #39ff14 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Soul
                </span>
              </motion.div>
            </div>

            {/* Cinematic Tagline — Not muted, very visible */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={phase >= 2 ? { scaleX: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="h-[1px] w-12 bg-accent/60"
              />
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={phase >= 2 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-[12px] md:text-[14px] uppercase tracking-[0.5em] font-medium text-white/90 drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              >
                Bharat Ki Sarvashreshth Team
              </motion.p>
            </div>

            {/* Dynamic establishing text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 0.6 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-10 grid grid-cols-2 gap-x-12 gap-y-2 opacity-0"
            >
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-accent/90">origin</p>
                <p className="font-display text-2xl text-white tracking-widest">EST. 2019 / IND</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.25em] text-energy/90">division</p>
                <p className="font-display text-2xl text-white tracking-widest">ARCHIVE_V.2.0</p>
              </div>
            </motion.div>
          </div>

          {/* Vignette effect */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-30" />


          {/* High-speed Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-accent via-accent to-energy"
            />
          </div>

          {/* Bottom pulse light */}
          <motion.div
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 h-[20vh] w-full bg-gradient-to-t from-accent/10 to-transparent pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
