require "json"
require "uri"

class GeocodingService
  Error = Class.new(StandardError)

  Location = Struct.new(
    :zip_code,
    :latitude,
    :longitude,
    :city,
    :state,
    :country,
    keyword_init: true
  )

  BASE_URL = "https://nominatim.openstreetmap.org/search".freeze
  DEFAULT_HTTP_CLIENT = HttpClient.default(Error)

  def initialize(address:, http_client: DEFAULT_HTTP_CLIENT, base_url: BASE_URL)
    @address = address.to_s.strip
    @http_client = http_client
    @base_url = base_url
  end

  def lookup
    raise Error, "Address can't be blank" if address.empty?

    response = http_client.call(uri, request_headers)
    parsed_body = parse_response(response)
    payload = parsed_body.first

    raise Error, "Address could not be located" if payload.blank?

    address_details = payload.fetch("address", {})
    zip_code = address_details["postcode"].to_s.strip

    raise Error, "Zip code unavailable for address" if zip_code.empty?

    Location.new(
      zip_code: zip_code,
      latitude: payload.fetch("lat").to_f,
      longitude: payload.fetch("lon").to_f,
      city: address_details["city"] || address_details["town"] || address_details["village"],
      state: address_details["state"],
      country: address_details["country"]
    )
  end

  private

  attr_reader :address, :http_client, :base_url

  def uri
    query = URI.encode_www_form(
      q: address,
      format: "jsonv2",
      addressdetails: 1,
      limit: 1
    )

    URI.parse("#{base_url}?#{query}")
  end

  def request_headers
    {
      "Accept"     => "application/json",
      "User-Agent" => "codefest-weather-assignment/1.0"
    }
  end

  def parse_response(response)
    unless response.code.to_i.between?(200, 299)
      raise Error, "Geocoding request failed with status #{response.code}"
    end

    JSON.parse(response.body)
  rescue JSON::ParserError => e
    raise Error, "Geocoding response was invalid JSON: #{e.message}"
  end
end
