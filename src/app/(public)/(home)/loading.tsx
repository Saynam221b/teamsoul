export default function Loading() {
  return (
    <section className="archive-section pt-24 md:pt-32" aria-live="polite" aria-busy="true">
      <div className="page-wrap">
        <div className="archive-loader-shell archive-panel rounded-[28px] p-5 md:rounded-[36px] md:p-8">
          <p className="archive-loader-kicker">Loading home archive</p>
          <h1 className="archive-loader-title">Preparing Team SOUL homepage</h1>
          <p className="archive-loader-description">
            Hero, trophy room, and timeline are syncing for a smooth transition.
          </p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-full animate-[archiveLoaderRail_1.6s_var(--motion-ease-premium)_infinite] bg-[linear-gradient(90deg,rgba(0,229,255,0.15),rgba(0,229,255,0.82),rgba(255,255,255,0.25))]" />
          </div>
        </div>
      </div>
    </section>
  );
}
