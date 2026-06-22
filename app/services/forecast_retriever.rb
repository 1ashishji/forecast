class ForecastRetriever
  Result = Struct.new(:forecast, :from_cache, keyword_init: true)

  def self.call(address, **dependencies)
    new(address, **dependencies).call
  end

  def initialize(address, geocoding_service: GeocodingService, weather_service: WeatherService, cache_repository: CacheRepository.new)
    @address = address
    @geocoding_service = geocoding_service
    @weather_service = weather_service
    @cache_repository = cache_repository
  end

  def call
    location = geocoding_service.new(address: address).lookup
    forecast, from_cache = cache_repository.fetch(location.zip_code) do
      weather_service.new(
        latitude: location.latitude,
        longitude: location.longitude,
        zip_code: location.zip_code,
        location_name: [location.city, location.state, location.country].compact.join(", ")
      ).current_forecast
    end

    Result.new(forecast: forecast, from_cache: from_cache)
  end

  private

  attr_reader :address, :geocoding_service, :weather_service, :cache_repository
end
