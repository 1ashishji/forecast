require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  def setup
    @employee = Employee.new(
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      job_title: "Software Engineer",
      country: "USA",
      salary: 100000.0
    )
  end

  test "should be valid with all required attributes" do
    assert @employee.valid?
  end

  test "should be invalid without first_name" do
    @employee.first_name = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:first_name], "can't be blank"
  end

  test "should be invalid without last_name" do
    @employee.last_name = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:last_name], "can't be blank"
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

  test "email must be unique" do
    @employee.save!
    duplicate_employee = @employee.dup
    assert_not duplicate_employee.valid?
    assert_includes duplicate_employee.errors[:email], "has already been taken"
  end
end
