require "rails_helper"

RSpec.describe GeocodingService do
  Response = Struct.new(:code, :body)

  describe "#lookup" do
    it "returns a normalized location with zip code and coordinates" do
      payload = [
        {
          "lat" => "37.3317",
          "lon" => "-122.0301",
          "address" => {
            "postcode" => "95014",
            "city" => "Cupertino",
            "state" => "California",
            "country" => "United States"
          }
        }
      ]

      client = ->(_uri, _headers) { Response.new("200", payload.to_json) }

      location = described_class.new(
        address: "1 Apple Park Way, Cupertino, CA",
        http_client: client
      ).lookup

      expect(location.zip_code).to eq("95014")
      expect(location.latitude).to eq(37.3317)
      expect(location.longitude).to eq(-122.0301)
      expect(location.city).to eq("Cupertino")
    end

    it "raises an error when the address cannot be resolved" do
      client = ->(_uri, _headers) { Response.new("200", [].to_json) }

      expect do
        described_class.new(address: "unknown", http_client: client).lookup
      end.to raise_error(GeocodingService::Error, "Address could not be located")
    end
  end
end
