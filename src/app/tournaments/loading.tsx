export default function Loading() {
  return (
    <div className="page-wrap pt-28 md:pt-32">
      <div className="archive-section !pt-0">
        <div className="archive-panel flex items-center gap-3 rounded-[28px] px-5 py-4 md:px-6">
          <span className="route-loading-dot" aria-hidden="true" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
            Loading tournament archive
          </p>
        </div>
      </div>
    </div>
  );
}
