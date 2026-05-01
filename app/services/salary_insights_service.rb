class SalaryInsightsService
  def self.country_stats(country)
    stats = Employee.where(country: country).select(
      Arel.sql('MIN(salary) as min_salary'),
      Arel.sql('MAX(salary) as max_salary'),
      Arel.sql('AVG(salary) as avg_salary'),
      Arel.sql('COUNT(*) as employee_count')
    ).first

    {
      min_salary: stats.min_salary.to_f,
      max_salary: stats.max_salary.to_f,
      avg_salary: stats.avg_salary.to_f,
      employee_count: stats.employee_count
    }
  end

  def self.job_title_stats(country, job_title)
    avg_salary = Employee.where(country: country, job_title: job_title).average(:salary)

    {
      avg_salary: avg_salary.to_f
    }
  end

  def self.advanced_metrics(country)
    # Placeholder for Step 4.3
    {}
  end
end
