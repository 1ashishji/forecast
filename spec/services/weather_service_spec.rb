require "rails_helper"

RSpec.describe WeatherService do
  Response = Struct.new(:code, :body)

  describe "#current_forecast" do
    it "maps open-meteo payloads into a forecast PORO" do
      payload = {
        "current" => {
          "time" => "2026-06-22T09:00",
          "temperature_2m" => 72.4,
          "weather_code" => 1
        },
        "daily" => {
          "time" => %w[2026-06-22 2026-06-23 2026-06-24 2026-06-25 2026-06-26],
          "temperature_2m_max" => [78.0, 76.0, 75.0, 74.0, 73.0],
          "temperature_2m_min" => [61.0, 60.0, 59.0, 58.0, 57.0],
          "weather_code" => [1, 2, 3, 61, 0]
        }
      }

      client = ->(_uri, _headers) { Response.new("200", payload.to_json) }

      forecast = described_class.new(
        latitude: 37.3317,
        longitude: -122.0301,
        zip_code: "95014",
        location_name: "Cupertino, California, United States",
        http_client: client
      ).current_forecast

      expect(forecast).to be_valid
      expect(forecast.temperature).to eq(72.4)
      expect(forecast.high_temperature).to eq(78.0)
      expect(forecast.low_temperature).to eq(61.0)
      expect(forecast.condition).to eq("Mainly clear")
      expect(forecast.daily_forecasts.size).to eq(5)
      expect(forecast.daily_forecasts.first.condition).to eq("Mainly clear")
    end

    it "raises a descriptive error for invalid JSON" do
      client = ->(_uri, _headers) { Response.new("200", "{") }

      expect do
        described_class.new(latitude: 1, longitude: 2, zip_code: "12345", http_client: client).current_forecast
      end.to raise_error(WeatherService::Error, /invalid JSON/)
    end
  end
end
