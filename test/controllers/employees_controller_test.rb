require "test_helper"

class EmployeesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @valid_params = {
      employee: {
        first_name: "Jane",
        last_name: "Doe",
        email: "jane.doe@example.com",
        job_title: "Product Manager",
        country: "Canada",
        salary: 120000.0
      }
    }
  end

  test "should create employee successfully" do
    assert_difference("Employee.count", 1) do
      post employees_url, params: @valid_params, as: :json
    end

    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "Jane", json_response["first_name"]
  end

  test "should return error on missing fields" do
    invalid_params = {
      employee: {
        first_name: "Jane"
        # missing last_name, email, etc.
      }
    }

    assert_no_difference("Employee.count") do
      post employees_url, params: invalid_params, as: :json
    end

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_not_nil json_response["last_name"]
    assert_not_nil json_response["email"]
  end

  test "should return error on invalid salary" do
    invalid_salary_params = @valid_params.deep_dup
    invalid_salary_params[:employee][:salary] = -5000

    assert_no_difference("Employee.count") do
      post employees_url, params: invalid_salary_params, as: :json
    end

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_not_nil json_response["salary"]
  end

  test "should list employees with cursor pagination" do
    Employee.destroy_all
    # Create 15 employees
    15.times do |i|
      Employee.create!(
        first_name: "Test#{i}",
        last_name: "User",
        email: "test#{i}@example.com",
        job_title: "Developer",
        country: "USA",
        salary: 50000
      )
    end

    get employees_url, params: { limit: 10 }, as: :json
    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal 10, json_response["employees"].length
    assert_not_nil json_response["next_cursor"]
    
    # Second page
    get employees_url, params: { limit: 10, cursor: json_response["next_cursor"] }, as: :json
    assert_response :success
    json_response2 = JSON.parse(response.body)

    assert_equal 5, json_response2["employees"].length
    assert_nil json_response2["next_cursor"]
  end
end
