require "test_helper"

class RecalculateInsightsJobTest < ActiveJob::TestCase
  setup do
    Employee.destroy_all
    @country = "TestLand"
    Employee.create!(first_name: "A", last_name: "1", email: "a1@ex.com", job_title: "Dev", country: @country, salary: 1000)
    Rails.cache.clear
  end

  test "job enqueued correctly" do
    assert_enqueued_with(job: RecalculateInsightsJob, args: [@country]) do
      RecalculateInsightsJob.perform_later(@country)
    end
  end

  test "job processes data and refreshes cache" do
    # Warm up cache
    SalaryInsightsService.country_stats(@country)
    
    # Change data
    Employee.update_all(salary: 5000)
    
    # Perform job synchronously
    RecalculateInsightsJob.perform_now(@country)
    
    # Verify cache has new data
    stats = SalaryInsightsService.country_stats(@country)
    assert_equal 5000.0, stats[:avg_salary]
  end
end
