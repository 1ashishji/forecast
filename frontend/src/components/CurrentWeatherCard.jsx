import { Thermometer, MapPin, Database } from 'lucide-react';

function formatTemp(value) {
  if (value === null || value === undefined || value === '') return '--';
  return `${Math.round(Number(value))}\u00b0F`;
}

/**
 * @param {{ forecast: import('../api/forecast').ForecastResponse }} props
 */
export function CurrentWeatherCard({ forecast }) {
  const { current, location_name, zip_code, source } = forecast;

  return (
    <article className="card current-weather-card">
      <div className="card-kicker">Current Forecast</div>

      <div className="current-main-row">
        <div>
          <h2>{location_name || zip_code}</h2>
          <p>{current.condition}</p>
        </div>
        <div className="current-temp">{formatTemp(current.temperature)}</div>
      </div>

      <div className="metric-grid">
        <div className="metric-pill">
          <Thermometer size={16} />
          <span>High {formatTemp(current.high_temperature)}</span>
        </div>
        <div className="metric-pill">
          <Thermometer size={16} />
          <span>Low {formatTemp(current.low_temperature)}</span>
        </div>
        <div className="metric-pill">
          <MapPin size={16} />
          <span>ZIP {zip_code}</span>
        </div>
        <div className="metric-pill">
          <Database size={16} />
          <span>{source === 'cache' ? 'Served from Cache' : 'Live API Result'}</span>
        </div>
      </div>
    </article>
  );
}
