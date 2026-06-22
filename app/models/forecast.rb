class Forecast
  include ActiveModel::Model
  include ActiveModel::Serializers::JSON

  DailyForecast = Struct.new(
    :date,
    :high_temperature,
    :low_temperature,
    :condition,
    :weather_code,
    keyword_init: true
  )

  attr_accessor :temperature,
                :high_temperature,
                :low_temperature,
                :condition,
                :zip_code,
                :latitude,
                :longitude,
                :weather_code,
                :location_name,
                :daily_forecasts,
                :fetched_at

  validates :temperature, :high_temperature, :low_temperature, :condition, :zip_code, presence: true

  def attributes
    {
      "temperature" => temperature,
      "high_temperature" => high_temperature,
      "low_temperature" => low_temperature,
      "condition" => condition,
      "zip_code" => zip_code,
      "latitude" => latitude,
      "longitude" => longitude,
      "weather_code" => weather_code,
      "location_name" => location_name,
      "daily_forecasts" => daily_forecasts,
      "fetched_at" => fetched_at
    }
  end
end
