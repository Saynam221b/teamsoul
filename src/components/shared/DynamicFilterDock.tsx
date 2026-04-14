"use client";

import type { ReactNode } from "react";

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
  return (
    <section
      className={`utility-panel dynamic-filter-inline relative z-20 mb-7 rounded-[24px] p-4 md:mb-9 md:rounded-[32px] md:p-7 ${className}`}
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
