class SalaryInsightsService
  def self.country_stats(country)
    Rails.cache.fetch("insights/country/#{country}/basic", expires_in: 1.hour) do
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
  end

  def self.job_title_stats(country, job_title)
    Rails.cache.fetch("insights/country/#{country}/job_title/#{job_title}", expires_in: 1.hour) do
      avg_salary = Employee.where(country: country, job_title: job_title).average(:salary)

      {
        avg_salary: avg_salary.to_f
      }
    end
  end

  def self.advanced_metrics(country)
    Rails.cache.fetch("insights/country/#{country}/advanced", expires_in: 1.hour) do
      salaries = Employee.where(country: country).pluck(:salary).map(&:to_f).sort
      count = salaries.size
      return {} if count == 0

      # Median Calculation
      median = if count.odd?
                 salaries[count / 2]
               else
                 (salaries[count / 2 - 1] + salaries[count / 2]) / 2.0
               end

      # Salary Distribution buckets
      distribution = {
        "0-2000" => 0,
        "2001-4000" => 0,
        "4001+" => 0
      }

      salaries.each do |s|
        if s <= 2000
          distribution["0-2000"] += 1
        elsif s <= 4000
          distribution["2001-4000"] += 1
        else
          distribution["4001+"] += 1
        end
      end

      {
        median_salary: median,
        salary_distribution: distribution
      }
    end
  end
end
