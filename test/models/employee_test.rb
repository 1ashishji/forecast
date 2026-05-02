require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  def setup
    @employee = Employee.new(
      full_name: "John Doe",
      job_title: "Software Engineer",
      country: "USA",
      salary: 100000.0
    )
  end

  test "should be valid with all required attributes" do
    assert @employee.valid?
  end

  test "should be invalid without full_name" do
    @employee.full_name = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:full_name], "can't be blank"
  end

  test "should be invalid without job_title" do
    @employee.job_title = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:job_title], "can't be blank"
  end

  test "should be invalid without country" do
    @employee.country = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:country], "can't be blank"
  end

  test "should be invalid without salary" do
    @employee.salary = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:salary], "can't be blank"
  end

  test "salary must be positive" do
    @employee.salary = -100
    assert_not @employee.valid?
    assert_includes @employee.errors[:salary], "must be greater than or equal to 0"
  end
end
