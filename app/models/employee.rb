class Employee < ApplicationRecord
  validates :full_name, presence: true
  validates :job_title, presence: true
  validates :country, presence: true
  validates :salary, presence: true, numericality: { greater_than_or_equal_to: 0 }

  after_save :clear_insights_cache
  after_destroy :clear_insights_cache

  private

  def clear_insights_cache
    SalaryInsightsService.clear_cache(country)
  end
end
