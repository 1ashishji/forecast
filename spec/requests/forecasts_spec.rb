require "rails_helper"

RSpec.describe "Forecast requests", type: :request do
  describe "POST /forecast" do
    it "returns a rendered forecast payload" do
      forecast = Forecast.new(
        temperature: 72,
        high_temperature: 78,
        low_temperature: 61,
        condition: "Mainly clear",
        zip_code: "95014",
        location_name: "Cupertino, California, United States",
        weather_code: 1,
        fetched_at: Time.zone.parse("2026-06-22T09:00:00Z"),
        daily_forecasts: [
          Forecast::DailyForecast.new(
            date: Date.new(2026, 6, 22),
            high_temperature: 78,
            low_temperature: 61,
            condition: "Mainly clear",
            weather_code: 1
          )
        ]
      )

      allow(ForecastRetriever).to receive(:call).and_return(
        ForecastRetriever::Result.new(forecast: forecast, from_cache: false)
      )

      post "/forecast", params: { address: "1 Apple Park Way, Cupertino, CA" }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to include(
        "zip_code" => "95014",
        "source" => "live_api"
      )
    end

    it "returns validation errors for missing input" do
      post "/forecast", params: {}

      expect(response).to have_http_status(:bad_request)
    end
  end
end
