require "rails_helper"

RSpec.describe ForecastRetriever do
  let(:location) do
    GeocodingService::Location.new(
      zip_code: "95014",
      latitude: 37.3317,
      longitude: -122.0301,
      city: "Cupertino",
      state: "California",
      country: "United States"
    )
  end

  let(:forecast) do
    Forecast.new(
      temperature: 72,
      high_temperature: 78,
      low_temperature: 61,
      condition: "Mainly clear",
      zip_code: "95014"
    )
  end

  let(:geocoding_service) { class_double(GeocodingService) }
  let(:weather_service) { class_double(WeatherService) }
  let(:cache_repository) { instance_double(CacheRepository) }
  let(:geocoding_instance) { instance_double(GeocodingService, lookup: location) }

  it "returns cached data when available" do
    allow(geocoding_service).to receive(:new).and_return(geocoding_instance)
    allow(weather_service).to receive(:new)
    allow(cache_repository).to receive(:fetch).with("95014").and_return([forecast, true])

    result = described_class.call(
      "1 Apple Park Way, Cupertino, CA",
      geocoding_service: geocoding_service,
      weather_service: weather_service,
      cache_repository: cache_repository
    )

    expect(result.forecast).to eq(forecast)
    expect(result.from_cache).to be(true)
    expect(weather_service).not_to have_received(:new)
  end

  it "calls the weather service when the cache is cold" do
    weather_instance = instance_double(WeatherService, current_forecast: forecast)

    allow(geocoding_service).to receive(:new).and_return(geocoding_instance)
    allow(weather_service).to receive(:new).and_return(weather_instance)
    allow(cache_repository).to receive(:fetch).with("95014").and_yield.and_return([forecast, false])

    result = described_class.call(
      "1 Apple Park Way, Cupertino, CA",
      geocoding_service: geocoding_service,
      weather_service: weather_service,
      cache_repository: cache_repository
    )

    expect(result.from_cache).to be(false)
    expect(weather_service).to have_received(:new).with(
      latitude: 37.3317,
      longitude: -122.0301,
      zip_code: "95014",
      location_name: "Cupertino, California, United States"
    )
  end
end
