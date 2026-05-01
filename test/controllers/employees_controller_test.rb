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
end
