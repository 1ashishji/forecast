class ForecastPresenter
  def initialize(forecast:, from_cache:)
    @forecast = forecast
    @from_cache = from_cache
  end

  def as_json(*)
    {
      zip_code: forecast.zip_code,
      location_name: forecast.location_name,
      source: from_cache ? "cache" : "live_api",
      current: {
        temperature: forecast.temperature,
        high_temperature: forecast.high_temperature,
        low_temperature: forecast.low_temperature,
        condition: forecast.condition,
        weather_code: forecast.weather_code
      },
      daily_forecast: Array(forecast.daily_forecasts).map do |day|
        {
          date: day.date.iso8601,
          high_temperature: day.high_temperature,
          low_temperature: day.low_temperature,
          condition: day.condition,
          weather_code: day.weather_code
        }
      end,
      fetched_at: forecast.fetched_at&.iso8601
    }
  end

  private

  attr_reader :forecast, :from_cache
end
