require "net/http"
require "uri"

module HttpClient
  OPEN_TIMEOUT  = 5  # seconds to establish TCP connection
  READ_TIMEOUT  = 10 # seconds to wait for response body

  # Returns a callable that performs a GET and returns the Net::HTTP response.
  # Raises the caller's error_class on any network-level failure so callers
  # never have to rescue raw socket exceptions.
  def self.default(error_class)
    lambda do |uri, headers = {}|
      request = Net::HTTP::Get.new(uri)
      headers.each { |key, value| request[key] = value }

      Net::HTTP.start(
        uri.hostname,
        uri.port,
        use_ssl:      uri.scheme == "https",
        open_timeout: OPEN_TIMEOUT,
        read_timeout: READ_TIMEOUT
      ) { |http| http.request(request) }
    rescue Net::OpenTimeout
      raise error_class, "Request timed out while connecting (#{OPEN_TIMEOUT}s)"
    rescue Net::ReadTimeout
      raise error_class, "Request timed out while reading response (#{READ_TIMEOUT}s)"
    rescue SocketError, Errno::ECONNREFUSED, Errno::ECONNRESET => e
      raise error_class, "Network error: #{e.message}"
    end
  end
end
