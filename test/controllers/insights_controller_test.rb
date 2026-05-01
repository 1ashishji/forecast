require "test_helper"

class InsightsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Employee.destroy_all
    @country = "CacheLand"
    Employee.create!(first_name: "A", last_name: "1", email: "a1@ex.com", job_title: "Dev", country: @country, salary: 1000)
    Rails.cache.clear
  end

  test "salary_by_country should return cached results on second request" do
    # First request: fills cache
    get insights_salary_by_country_url, params: { country: @country }, as: :json
    assert_response :success
    initial_response = JSON.parse(response.body)

    # Modify database directly (bypassing cache invalidation for testing)
    Employee.update_all(salary: 5000)

    # Second request: should still return the cached 1000.0
    get insights_salary_by_country_url, params: { country: @country }, as: :json
    assert_response :success
    second_response = JSON.parse(response.body)

    assert_equal initial_response["avg_salary"], second_response["avg_salary"]
    assert_equal 1000.0, second_response["avg_salary"]
  end

  test "salary_by_country should recalculate after cache is cleared or expires" do
    get insights_salary_by_country_url, params: { country: @country }, as: :json
    
    # Modify database
    Employee.update_all(salary: 5000)
    
    # Clear cache
    Rails.cache.clear

    # Third request: should fetch new data (5000.0)
    get insights_salary_by_country_url, params: { country: @country }, as: :json
    assert_response :success
    third_response = JSON.parse(response.body)

    assert_equal 5000.0, third_response["avg_salary"]
  end
end
