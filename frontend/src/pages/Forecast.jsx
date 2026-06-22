import { CloudSun, AlertTriangle } from 'lucide-react';

import { useForecast } from '../hooks/useForecast';
import { AddressForm } from '../components/AddressForm';
import { ForecastSkeleton } from '../components/ForecastSkeleton';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { MetaCard } from '../components/MetaCard';
import { DailyForecastCard } from '../components/DailyForecastCard';

export default function ForecastPage() {
  const { isLoading, forecast, error, lookup } = useForecast();

  return (
    <div className="forecast-shell">
      {/* Hero + form */}
      <section className="hero-card animate-in">
        <div className="hero-copy">

          <h1>
            TEST REASS  THEME
          </h1>
          <p>
            Enter a full mailing address and the app will geocode it, fetch the
            latest forecast, and tell you whether the result came from cache or a
            live API request.
          </p>
        </div>

        <AddressForm onSubmit={lookup} isLoading={isLoading} />
      </section>

      {/* Error banner */}
      {error && (
        <section className="status-card status-card-error animate-in" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </section>
      )}

      {/* Loading skeleton */}
      {isLoading && <ForecastSkeleton />}

      {/* Results */}
      {!isLoading && forecast && (
        <section className="forecast-results animate-in">
          <div className="overview-grid">
            <CurrentWeatherCard forecast={forecast} />
            <MetaCard forecast={forecast} />
          </div>
          <DailyForecastCard days={forecast.daily_forecast ?? []} />
        </section>
      )}

      {/* Empty state */}
      {!isLoading && !forecast && !error && (
        <section className="empty-state card animate-in">
          <CloudSun size={28} />
          <h2>No forecast loaded yet</h2>
          <p>Submit an address above to see the current conditions and 5-day outlook.</p>
        </section>
      )}
    </div>
  );
}
