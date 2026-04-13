"use client";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <span className="font-display text-xs font-600 tracking-[0.12em] text-text-secondary">
            TEAM SOUL ARCHIVE
          </span>

          {/* Meta */}
          <div className="flex items-center gap-6">
            <span className="text-xs text-text-muted">
              Est. 2018
            </span>
            <span className="text-xs text-text-dim">·</span>
            <span className="text-xs text-text-muted">
              Data verified Apr 2026
            </span>
          </div>

          {/* Credits */}
          <div className="text-xs text-text-muted">
            Built by{" "}
            <span className="text-accent">D3xTRverse</span>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-text-dim uppercase tracking-widest">
          All data sourced from Liquipedia, Esports Charts, and verified public records.
        </p>
      </div>
    </footer>
  );
}
