class EmployeePromotionService
  def initialize(job_title)
    @job_title = job_title
  end

  # Performs a bulk promotion with high performance SQL update_all
  # Instead of iterating through thousands of records, we use a single SQL query
  def promote_all(factor)
    raise ArgumentError, "Factor must be positive" if factor <= 0

    # Using update_all for O(1) database performance regardless of count
    # Note: This bypasses callbacks/validations, which is intentional for bulk performance
    Employee.where(job_title: @job_title).update_all("salary = salary * #{factor.to_f}")
  end
end
