"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DynamicFilterDockProps {
  summaryLabel: string;
  resultsLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function DynamicFilterDock({
  summaryLabel,
  resultsLabel,
  children,
  footer,
  className = "",
}: DynamicFilterDockProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isSoftened, setIsSoftened] = useState(false);

  useEffect(() => {
    const updateSoftenedState = () => {
      const stickyTop = window.innerWidth < 768 ? 78 : 96;
      const nextValue = (sectionRef.current?.getBoundingClientRect().top ?? 999) <= stickyTop + 4;
      setIsSoftened((currentValue) => (currentValue === nextValue ? currentValue : nextValue));
    };

    updateSoftenedState();
    window.addEventListener("scroll", updateSoftenedState, { passive: true });
    window.addEventListener("resize", updateSoftenedState);

    return () => {
      window.removeEventListener("scroll", updateSoftenedState);
      window.removeEventListener("resize", updateSoftenedState);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-softened={isSoftened ? "true" : "false"}
      className={`utility-panel dynamic-filter-inline sticky top-[84px] z-30 mb-6 rounded-[24px] p-4 md:top-24 md:mb-8 md:rounded-[28px] md:p-5 ${className}`}
    >
      <div className="dynamic-filter-meta">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted md:text-xs md:tracking-[0.22em]">
            Active filters
          </p>
          <p className="mt-2 text-sm text-text-secondary md:text-base">{summaryLabel}</p>
        </div>
        {resultsLabel ? (
          <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted md:text-xs md:tracking-[0.18em]">
            {resultsLabel}
          </p>
        ) : null}
      </div>

      <div className="dynamic-filter-panel-body">{children}</div>

      {footer ? <div className="filter-footer">{footer}</div> : null}
    </section>
  );
}
