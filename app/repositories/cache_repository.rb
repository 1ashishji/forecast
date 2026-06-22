class CacheRepository
  DEFAULT_NAMESPACE = "forecast".freeze
  DEFAULT_EXPIRY    = 30.minutes

  def initialize(cache: Rails.cache, namespace: DEFAULT_NAMESPACE, expires_in: DEFAULT_EXPIRY)
    @cache      = cache
    @namespace  = namespace
    @expires_in = expires_in
  end

  # Atomic fetch: Rails.cache.fetch calls the block only on a cache miss and
  # stores the result in a single operation, eliminating the read → yield → write
  # race condition where concurrent requests for the same ZIP code could both
  # miss and make redundant live API calls.
  #
  # Returns [forecast, from_cache].
  def fetch(zip_code)
    from_cache = true

    value = cache.fetch(cache_key(zip_code), expires_in: expires_in) do
      from_cache = false
      yield
    end

    [value, from_cache]
  end

  def read(zip_code)
    cache.read(cache_key(zip_code))
  end

  def write(zip_code, value)
    cache.write(cache_key(zip_code), value, expires_in: expires_in)
  end

  def cache_key(zip_code)
    "#{namespace}:#{zip_code}"
  end

  private

  attr_reader :cache, :namespace, :expires_in
end
