require "test_helper"

class SalaryInsightsServiceTest < ActiveSupport::TestCase
  setup do
    Employee.destroy_all
    @country = "TestLand"
    @job_title = "Developer"
    
    # Create employees with specific salaries to make math easy
    # Salaries: 1000, 2000, 3000, 4000, 5000
    # Total count: 5
    # Total sum: 15000
    # Avg: 3000
    # Median: 3000
    Employee.create!(first_name: "A", last_name: "1", email: "a1@ex.com", job_title: @job_title, country: @country, salary: 1000)
    Employee.create!(first_name: "B", last_name: "2", email: "b2@ex.com", job_title: @job_title, country: @country, salary: 2000)
    Employee.create!(first_name: "C", last_name: "3", email: "c3@ex.com", job_title: "Manager", country: @country, salary: 3000)
    Employee.create!(first_name: "D", last_name: "4", email: "d4@ex.com", job_title: "Manager", country: @country, salary: 4000)
    Employee.create!(first_name: "E", last_name: "5", email: "e5@ex.com", job_title: "Executive", country: @country, salary: 5000)
  end

  test "country_stats returns correct basic metrics" do
    stats = SalaryInsightsService.country_stats(@country)
    
    assert_equal 1000.0, stats[:min_salary]
    assert_equal 5000.0, stats[:max_salary]
    assert_equal 3000.0, stats[:avg_salary]
    assert_equal 5, stats[:employee_count]
  end

  test "job_title_stats returns correct avg salary within country" do
    stats = SalaryInsightsService.job_title_stats(@country, @job_title)
    assert_equal 1500.0, stats[:avg_salary]
    
    stats_manager = SalaryInsightsService.job_title_stats(@country, "Manager")
    assert_equal 3500.0, stats_manager[:avg_salary]
  end

  test "advanced_metrics returns correct median salary" do
    # This will fail in Step 4.1/4.2
    stats = SalaryInsightsService.advanced_metrics(@country)
    assert_equal 3000.0, stats[:median_salary]
  end

  test "advanced_metrics returns correct salary distribution buckets" do
    # This will fail in Step 4.1/4.2
    # Buckets: 0-2000, 2001-4000, 4001+
    stats = SalaryInsightsService.advanced_metrics(@country)
    distribution = stats[:salary_distribution]
    
    assert_equal 2, distribution["0-2000"]
    assert_equal 2, distribution["2001-4000"]
    assert_equal 1, distribution["4001+"]
  end
end
