class SalaryInsightsService
  def self.country_stats(country)
    # Using standard ActiveRecord calculation methods for maximum compatibility
    scope = Employee.where(country: country)
    count = scope.count
    return {} if count == 0

    {
      min_salary: scope.minimum(:salary).to_f,
      max_salary: scope.maximum(:salary).to_f,
      avg_salary: scope.average(:salary).to_f,
      employee_count: count
    }
  end

  def self.job_title_stats(country, job_title)
    avg_salary = Employee.where(country: country, job_title: job_title).average(:salary)
    { avg_salary: avg_salary.to_f }
  end

  def self.advanced_metrics(country)
    salaries = Employee.where(country: country).pluck(:salary).map(&:to_f).sort
    count = salaries.size
    return {} if count == 0

    median = if count.odd?
               salaries[count / 2]
             else
               (salaries[count / 2 - 1] + salaries[count / 2]) / 2.0
             end

    distribution = {
      "0-100k" => 0,
      "100k-200k" => 0,
      "200k-300k" => 0,
      "300k+" => 0
    }

    salaries.each do |s|
      if s <= 100000
        distribution["0-100k"] += 1
      elsif s <= 200000
        distribution["100k-200k"] += 1
      elsif s <= 300000
        distribution["200k-300k"] += 1
      else
        distribution["300k+"] += 1
      end
    end

    {
      median_salary: median,
      salary_distribution: distribution
    }
  end
end
