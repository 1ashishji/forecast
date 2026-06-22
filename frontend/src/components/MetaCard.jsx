/**
 * Displays request metadata: source, fetched_at, weather code.
 *
 * @param {{ forecast: object }} props
 */
export function MetaCard({ forecast }) {
  const { source, fetched_at, current } = forecast;

  const fetchedDisplay = fetched_at
    ? new Date(fetched_at).toLocaleString()
    : '--';

  return (
    <article className="card meta-card">
      <div className="card-kicker">Request Details</div>
      <ul className="meta-list">
        <li>
          <span>Source</span>
          <strong>{source}</strong>
        </li>
        <li>
          <span>Fetched At</span>
          <strong>{fetchedDisplay}</strong>
        </li>
        <li>
          <span>Weather Code</span>
          <strong>{current.weather_code ?? '--'}</strong>
        </li>
      </ul>
    </article>
  );
}
