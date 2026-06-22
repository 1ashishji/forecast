require 'rails_helper'

RSpec.describe Forecast, type: :model do
  describe 'validations' do
    it 'validates presence of temperature' do
      forecast = Forecast.new(high_temperature: 80, low_temperature: 60, condition: 'Clear', zip_code: '12345')
      expect(forecast).not_to be_valid
      expect(forecast.errors[:temperature]).to include("can't be blank")
    end

    it 'validates presence of high_temperature' do
      forecast = Forecast.new(temperature: 70, low_temperature: 60, condition: 'Clear', zip_code: '12345')
      expect(forecast).not_to be_valid
      expect(forecast.errors[:high_temperature]).to include("can't be blank")
    end

    it 'validates presence of low_temperature' do
      forecast = Forecast.new(temperature: 70, high_temperature: 80, condition: 'Clear', zip_code: '12345')
      expect(forecast).not_to be_valid
      expect(forecast.errors[:low_temperature]).to include("can't be blank")
    end

    it 'validates presence of condition' do
      forecast = Forecast.new(temperature: 70, high_temperature: 80, low_temperature: 60, zip_code: '12345')
      expect(forecast).not_to be_valid
      expect(forecast.errors[:condition]).to include("can't be blank")
    end

    it 'validates presence of zip_code' do
      forecast = Forecast.new(temperature: 70, high_temperature: 80, low_temperature: 60, condition: 'Clear')
      expect(forecast).not_to be_valid
      expect(forecast.errors[:zip_code]).to include("can't be blank")
    end

    it 'is valid with all required attributes' do
      forecast = Forecast.new(temperature: 70, high_temperature: 80, low_temperature: 60, condition: 'Clear', zip_code: '12345')
      expect(forecast).to be_valid
    end
  end

  describe '#attributes' do
    it 'returns a hash of attributes' do
      forecast = Forecast.new(
        temperature: 70,
        high_temperature: 80,
        low_temperature: 60,
        condition: 'Clear',
        zip_code: '12345',
        latitude: 10.0,
        longitude: 20.0,
        weather_code: 1,
        location_name: 'Test City',
        daily_forecasts: [],
        fetched_at: '2023-01-01'
      )

      attrs = forecast.attributes
      expect(attrs['temperature']).to eq(70)
      expect(attrs['high_temperature']).to eq(80)
      expect(attrs['low_temperature']).to eq(60)
      expect(attrs['condition']).to eq('Clear')
      expect(attrs['zip_code']).to eq('12345')
      expect(attrs['latitude']).to eq(10.0)
      expect(attrs['longitude']).to eq(20.0)
      expect(attrs['weather_code']).to eq(1)
      expect(attrs['location_name']).to eq('Test City')
      expect(attrs['daily_forecasts']).to eq([])
      expect(attrs['fetched_at']).to eq('2023-01-01')
    end
  end
end
