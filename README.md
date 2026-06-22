
A Rails 7 API implementation for a weather-forecast assignment that emphasizes architecture, caching, testability, and production readiness rather than only fetching temperature data.


The API accepts a street address, resolves it to coordinates plus ZIP code, checks a ZIP-based cache, fetches forecast data from Open-Meteo when necessary, and returns a normalized JSON payload that clearly indicates whether the response came from cache or a live API call.

## Architecture

```text
app/
├── controllers/
│   └── forecasts_controller.rb
├── models/
│   └── forecast.rb
├── presenters/
│   └── forecast_presenter.rb
├── repositories/
│   └── cache_repository.rb
└── services/
    ├── forecast_retriever.rb
    ├── geocoding_service.rb
    └── weather_service.rb
```

## Request Flow

```text
Address Input
      ↓
GeocodingService
      ↓
ZIP Code + Coordinates
      ↓
CacheRepository
      ↓
Cached?
 ┌────┴─────┐
Yes        No
 ↓          ↓
Return    WeatherService
            ↓
       Open-Meteo API
            ↓
       Cache for 30m
            ↓
      ForecastPresenter
```

## API Integrations

### Weather Provider

The weather layer uses Open-Meteo forecast data.

Example endpoint:

```text
https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m
```

The implementation requests:

- `current.temperature_2m`
- `current.weather_code`
- `daily.temperature_2m_max`
- `daily.temperature_2m_min`
- `daily.weather_code`

### Geocoding Provider

The geocoding layer is intentionally isolated behind `GeocodingService` so the provider can be swapped without impacting controller or cache logic. The current implementation uses a no-key HTTP geocoding endpoint and normalizes ZIP code, latitude, longitude, city, state, and country.

## Caching Strategy

- Cache key: `forecast:<zip_code>`
- TTL: `30.minutes`
- Scope: ZIP-code level cache, matching the assignment requirement
- Source marker: response includes `source: "cache"` or `source: "live_api"`

## Endpoint

### `POST /forecast`

Params:

```json
{
  "address": "1 Apple Park Way, Cupertino, CA"
}
```

Example response:

```json
{
  "zip_code": "95014",
  "location_name": "Cupertino, California, United States",
  "source": "live_api",
  "current": {
    "temperature": 72.4,
    "high_temperature": 78.0,
    "low_temperature": 61.0,
    "condition": "Mainly clear",
    "weather_code": 1
  },
  "daily_forecast": [
    {
      "date": "2026-06-22",
      "high_temperature": 78.0,
      "low_temperature": 61.0,
      "condition": "Mainly clear",
      "weather_code": 1
    }
  ],
  "fetched_at": "2026-06-22T09:00:00Z"
}
```

## Testing

RSpec coverage has been added around:

- weather response mapping
- geocoding normalization
- ZIP-cache behavior
- orchestration in `ForecastRetriever`
- presenter serialization
- request contract for `POST /forecast`

Recommended commands after installing gems:

```bash
bundle install
bundle exec rspec
```

## Design Decisions

- Service-object orchestration keeps controller code thin.
- Dependency injection for HTTP clients makes service specs deterministic.
- A presenter isolates the public API shape from provider payloads.
- A repository isolates caching concerns and TTL policy.
- Forecast data is represented as a PORO rather than an Active Record model because it is transient external data.

## Production Readiness

- Cache layer can be moved from memory store to Redis without changing callers.
- Geocoding and weather providers are abstracted and swappable.
- Provider failures return explicit API errors instead of leaking low-level exceptions.
- The request contract is stable even if upstream provider payloads evolve.
- The 5-day forecast structure supports future UI or background warming jobs.

## Future Improvements

- Replace the simple HTTP client lambda with Faraday middleware for retries and observability.
- Add rate-limit backoff and circuit-breaker behavior around external APIs.
- Add VCR or WebMock-backed contract tests for provider integrations.
- Introduce structured logging and request correlation IDs.
- Add a background job to pre-warm popular ZIP-code forecasts.
