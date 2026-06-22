require "rails_helper"

RSpec.describe CacheRepository do
  let(:memory_store) { ActiveSupport::Cache::MemoryStore.new }
  let(:repository) { described_class.new(cache: memory_store, expires_in: 30.minutes) }

  describe "#fetch" do
    it "returns cached records when present" do
      memory_store.write("forecast:95014", "cached-value", expires_in: 30.minutes)

      value, from_cache = repository.fetch("95014") { "live-value" }

      expect(value).to eq("cached-value")
      expect(from_cache).to be(true)
    end

    it "writes and returns fresh records when cache is empty" do
      value, from_cache = repository.fetch("95014") { "live-value" }

      expect(value).to eq("live-value")
      expect(from_cache).to be(false)
      expect(memory_store.read("forecast:95014")).to eq("live-value")
    end
  end
end
