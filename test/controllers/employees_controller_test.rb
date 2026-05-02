require "test_helper"

class EmployeesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @valid_params = {
      employee: {
        full_name: "Jane Doe",
        job_title: "Product Manager",
        country: "Canada",
        salary: 120000.0,
        currency: "USD"
      }
    }
  end

  test "should create employee successfully with nested params" do
    assert_difference("Employee.count", 1) do
      post api_v1_employees_url, params: @valid_params, as: :json
    end

    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "Jane Doe", json_response["full_name"]
  end

  test "should create employee successfully with flat params" do
    flat_params = {
      full_name: "Flat User",
      job_title: "Developer",
      country: "US",
      salary: 90000
    }
    assert_difference("Employee.count", 1) do
      post api_v1_employees_url, params: flat_params, as: :json
    end

    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "Flat User", json_response["full_name"]
  end

  test "should list employees with cursor pagination and total count" do
    Employee.destroy_all
    15.times do |i|
      Employee.create!(
        full_name: "Test User #{i}",
        job_title: "Developer",
        country: "USA",
        salary: 50000
      )
    end

    get api_v1_employees_url, params: { limit: 10 }, as: :json
    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal 10, json_response["employees"].length
    assert_equal 15, json_response["total_count"]
    assert_not_nil json_response["next_cursor"]
  end

  test "should get countries list" do
    get countries_api_v1_employees_url, as: :json
    assert_response :success
    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
  end

  test "should update valid employee" do
    employee = Employee.create!(@valid_params[:employee])
    patch api_v1_employee_url(employee), params: { employee: { full_name: "Updated Name" } }, as: :json
    assert_response :success
    
    employee.reload
    assert_equal "Updated Name", employee.full_name
  end

  test "should delete employee" do
    employee = Employee.create!(@valid_params[:employee])
    assert_difference("Employee.count", -1) do
      delete api_v1_employee_url(employee), as: :json
    end
    assert_response :no_content
  end

  test "should handle non-existing ID" do
    get api_v1_employee_url(-1), as: :json
    assert_response :not_found
  end
end
