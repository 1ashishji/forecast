require "rails_helper"

RSpec.describe ForecastPresenter do
  it "serializes a forecast with source metadata" do
    forecast = Forecast.new(
      temperature: 70,
      high_temperature: 76,
      low_temperature: 62,
      condition: "Clear sky",
      zip_code: "95014",
      weather_code: 0,
      location_name: "Cupertino, California, United States",
      fetched_at: Time.zone.parse("2026-06-22T09:00:00Z"),
      daily_forecasts: [
        Forecast::DailyForecast.new(
          date: Date.new(2026, 6, 22),
          high_temperature: 76,
          low_temperature: 62,
          condition: "Clear sky",
          weather_code: 0
        )
      ]
    )

    payload = described_class.new(forecast: forecast, from_cache: true).as_json

    expect(payload[:zip_code]).to eq("95014")
    expect(payload[:source]).to eq("cache")
    expect(payload[:current][:condition]).to eq("Clear sky")
    expect(payload[:daily_forecast].first[:date]).to eq("2026-06-22")
  end
end
