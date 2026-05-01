class InsightsController < ApplicationController
  def salary_by_country
    country = params[:country]
    if country.blank?
      return render json: { error: 'Country parameter is required' }, status: :bad_request
    end

    stats = Employee.where(country: country).select(
      Arel.sql('MIN(salary) as min_salary'),
      Arel.sql('MAX(salary) as max_salary'),
      Arel.sql('AVG(salary) as avg_salary'),
      Arel.sql('COUNT(*) as total_employees')
    ).first

    render json: {
      country: country,
      min_salary: stats.min_salary || 0,
      max_salary: stats.max_salary || 0,
      avg_salary: stats.avg_salary || 0,
      total_employees: stats.total_employees || 0
    }
  end

  def salary_by_job_title_and_country
    country = params[:country]
    job_title = params[:job_title]

    if country.blank? || job_title.blank?
      return render json: { error: 'Country and job_title parameters are required' }, status: :bad_request
    end

    avg_salary = Employee.where(country: country, job_title: job_title).average(:salary)

    render json: {
      country: country,
      job_title: job_title,
      avg_salary: avg_salary || 0
    }
  end
end
