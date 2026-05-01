class RecalculateInsightsJob < ApplicationJob
  queue_as :default

  def perform(country)
    # Clear specific cache keys to force refresh
    Rails.cache.delete("insights/country/#{country}/basic")
    Rails.cache.delete("insights/country/#{country}/advanced")
    
    # Call service methods to repopulate cache with fresh data
    SalaryInsightsService.country_stats(country)
    SalaryInsightsService.advanced_metrics(country)
  end
end
