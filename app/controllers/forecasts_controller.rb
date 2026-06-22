class ForecastsController < ApplicationController
  rescue_from ActionController::ParameterMissing, with: :render_bad_request
  rescue_from GeocodingService::Error, with: :render_unprocessable_entity
  rescue_from WeatherService::Error, with: :render_bad_gateway

  def create
    result = ForecastRetriever.call(forecast_params.fetch(:address))

    render json: ForecastPresenter.new(
      forecast: result.forecast,
      from_cache: result.from_cache
    ).as_json
  end

  private

  def forecast_params
    params.permit(:address)
  end

  def render_bad_request(error)
    render json: { error: error.message }, status: :bad_request
  end

  def render_unprocessable_entity(error)
    render json: { error: error.message }, status: :unprocessable_entity
  end

  def render_bad_gateway(error)
    render json: { error: error.message }, status: :bad_gateway
  end
end
