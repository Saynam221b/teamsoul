type ArchiveLoaderRoute = "tournaments" | "roster" | "champions";

interface ArchiveLoaderMetric {
  label: string;
  value: string;
}

interface ArchiveRouteLoaderProps {
  route: ArchiveLoaderRoute;
  title: string;
  subtitle: string;
  metrics: ArchiveLoaderMetric[];
}

function TournamentLoaderVisual() {
  return (
    <div className="archive-loader-visual archive-loader-visual-tournaments" aria-hidden="true">
      <div className="archive-loader-bracket-column">
        <span className="archive-loader-node" />
        <span className="archive-loader-node archive-loader-node-dim" />
        <span className="archive-loader-node" />
      </div>
      <div className="archive-loader-bracket-rail">
        <span className="archive-loader-rail archive-loader-rail-short" />
        <span className="archive-loader-rail archive-loader-rail-long" />
        <span className="archive-loader-rail archive-loader-rail-short" />
      </div>
      <div className="archive-loader-bracket-column archive-loader-bracket-column-mid">
        <span className="archive-loader-node archive-loader-node-accent" />
        <span className="archive-loader-node archive-loader-node-dim" />
      </div>
      <div className="archive-loader-bracket-rail archive-loader-bracket-rail-final">
        <span className="archive-loader-rail archive-loader-rail-long" />
      </div>
      <div className="archive-loader-bracket-column archive-loader-bracket-column-final">
        <span className="archive-loader-node archive-loader-node-gold" />
      </div>
    </div>
  );
}

function RosterLoaderVisual() {
  return (
    <div className="archive-loader-visual archive-loader-visual-roster" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="archive-loader-roster-card">
          <span className="archive-loader-avatar" />
          <div className="archive-loader-roster-copy">
            <span className="archive-loader-line archive-loader-line-strong" />
            <span className="archive-loader-line archive-loader-line-soft" />
          </div>
          <span className="archive-loader-chip" />
        </div>
      ))}
    </div>
  );
}

function ChampionsLoaderVisual() {
  return (
    <div className="archive-loader-visual archive-loader-visual-champions" aria-hidden="true">
      <div className="archive-loader-trophy-shell">
        <span className="archive-loader-trophy-crown" />
        <span className="archive-loader-trophy-stem" />
        <span className="archive-loader-trophy-base" />
      </div>
      <div className="archive-loader-frame-rail">
        <span className="archive-loader-frame archive-loader-frame-wide" />
        <span className="archive-loader-frame" />
        <span className="archive-loader-frame archive-loader-frame-tall" />
      </div>
    </div>
  );
}

function RouteVisual({ route }: Pick<ArchiveRouteLoaderProps, "route">) {
  if (route === "tournaments") return <TournamentLoaderVisual />;
  if (route === "roster") return <RosterLoaderVisual />;
  return <ChampionsLoaderVisual />;
}

export default function ArchiveRouteLoader({
  route,
  title,
  subtitle,
  metrics,
}: ArchiveRouteLoaderProps) {
  return (
    <div className="page-wrap pt-28 md:pt-32">
      <section className="archive-section !pt-0" aria-live="polite" aria-busy="true">
        <div className="archive-loader-shell archive-panel rounded-[28px] p-5 md:rounded-[36px] md:p-8">
          <div className="archive-loader-copy">
            <p className="archive-loader-kicker">{subtitle}</p>
            <h1 className="archive-loader-title">{title}</h1>
            <p className="archive-loader-description">
              The next archive section is loading now. Filters, stats, and results will settle in without
              blocking the full page.
            </p>
          </div>

          <div className="archive-loader-stage" data-route-theme={route}>
            <RouteVisual route={route} />
          </div>

          <div className="archive-loader-metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="archive-loader-metric">
                <p className="archive-loader-metric-label">{metric.label}</p>
                <p className="archive-loader-metric-value">{metric.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
