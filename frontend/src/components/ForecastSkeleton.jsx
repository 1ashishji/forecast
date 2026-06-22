/**
 * Skeleton screen shown while the forecast is loading.
 * Matches the layout of the real result so there's no jarring shift.
 */
export function ForecastSkeleton() {
  return (
    <section className="forecast-results animate-in" aria-busy="true" aria-label="Loading forecast">
      <div className="overview-grid">
        {/* Current weather skeleton */}
        <div className="card current-weather-card">
          <div className="skeleton skeleton-badge" />
          <div className="current-main-row">
            <div>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-subtitle" />
            </div>
            <div className="skeleton skeleton-temp" />
          </div>
          <div className="metric-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton skeleton-pill" />
            ))}
          </div>
        </div>

        {/* Meta card skeleton */}
        <div className="card meta-card">
          <div className="skeleton skeleton-badge" />
          <div className="meta-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton skeleton-meta-row" />
            ))}
          </div>
        </div>
      </div>

      {/* Daily forecast skeleton */}
      <div className="card daily-card">
        <div className="daily-header">
          <div>
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-subtitle" style={{ marginTop: '0.7rem' }} />
          </div>
        </div>
        <div className="daily-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="daily-tile">
              <div className="skeleton skeleton-day-date" />
              <div className="skeleton skeleton-day-cond" />
              <div className="skeleton skeleton-day-temp" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
