require "json"
require "uri"

class WeatherService
  Error = Class.new(StandardError)

  BASE_URL = "https://api.open-meteo.com/v1/forecast".freeze

  WEATHER_CODES = {
    0  => "Clear sky",
    1  => "Mainly clear",
    2  => "Partly cloudy",
    3  => "Overcast",
    45 => "Fog",
    48 => "Depositing rime fog",
    51 => "Light drizzle",
    53 => "Moderate drizzle",
    55 => "Dense drizzle",
    56 => "Light freezing drizzle",
    57 => "Dense freezing drizzle",
    61 => "Slight rain",
    63 => "Moderate rain",
    65 => "Heavy rain",
    66 => "Light freezing rain",
    67 => "Heavy freezing rain",
    71 => "Slight snow fall",
    73 => "Moderate snow fall",
    75 => "Heavy snow fall",
    77 => "Snow grains",
    80 => "Slight rain showers",
    81 => "Moderate rain showers",
    82 => "Violent rain showers",
    85 => "Slight snow showers",
    86 => "Heavy snow showers",
    95 => "Thunderstorm",
    96 => "Thunderstorm with slight hail",
    99 => "Thunderstorm with heavy hail"
  }.freeze

  DEFAULT_HTTP_CLIENT = HttpClient.default(Error)

  def initialize(latitude:, longitude:, zip_code:, location_name: nil, http_client: DEFAULT_HTTP_CLIENT, base_url: BASE_URL)
    @latitude      = latitude
    @longitude     = longitude
    @zip_code      = zip_code
    @location_name = location_name
    @http_client   = http_client
    @base_url      = base_url
  end

  def current_forecast
    response = http_client.call(uri, "Accept" => "application/json")
    payload  = parse_response(response)

    current         = payload.fetch("current")
    daily           = payload.fetch("daily")
    daily_forecasts = build_daily_forecasts(daily)
    today           = daily_forecasts.first

    Forecast.new(
      temperature:      current.fetch("temperature_2m"),
      high_temperature: today&.high_temperature,
      low_temperature:  today&.low_temperature,
      condition:        weather_label(current.fetch("weather_code")),
      zip_code:         zip_code,
      latitude:         latitude,
      longitude:        longitude,
      weather_code:     current.fetch("weather_code"),
      location_name:    location_name,
      daily_forecasts:  daily_forecasts,
      fetched_at:       Time.zone.parse(payload["current"]["time"])
    )
  end

  private

  attr_reader :latitude, :longitude, :zip_code, :location_name, :http_client, :base_url

  def uri
    query = URI.encode_www_form(
      latitude:         latitude,
      longitude:        longitude,
      current:          "temperature_2m,weather_code",
      daily:            "weather_code,temperature_2m_max,temperature_2m_min",
      forecast_days:    5,
      temperature_unit: "fahrenheit",
      timezone:         "auto"
    )

    URI.parse("#{base_url}?#{query}")
  end

  def parse_response(response)
    unless response.code.to_i.between?(200, 299)
      raise Error, "Weather request failed with status #{response.code}"
    end

    JSON.parse(response.body)
  rescue JSON::ParserError => e
    raise Error, "Weather response was invalid JSON: #{e.message}"
  end

  def build_daily_forecasts(daily)
    dates = daily.fetch("time")
    highs = daily.fetch("temperature_2m_max")
    lows  = daily.fetch("temperature_2m_min")
    codes = daily.fetch("weather_code")

    dates.each_index.map do |i|
      Forecast::DailyForecast.new(
        date:             Date.parse(dates[i]),
        high_temperature: highs[i],
        low_temperature:  lows[i],
        condition:        weather_label(codes[i]),
        weather_code:     codes[i]
      )
    end
  end

  def weather_label(code)
    WEATHER_CODES.fetch(code.to_i, "Unknown")
  end
end
