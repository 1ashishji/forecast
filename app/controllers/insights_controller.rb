class InsightsController < ApplicationController
  def salary_by_country
    country = params[:country]
    if country.blank?
      return render json: { error: 'Country parameter is required' }, status: :bad_request
    end

    basic_stats = SalaryInsightsService.country_stats(country)
    advanced_stats = SalaryInsightsService.advanced_metrics(country)

    render json: {
      country: country,
      **basic_stats,
      **advanced_stats
    }
  end

  def salary_by_job_title_and_country
    country = params[:country]
    job_title = params[:job_title]

    if country.blank? || job_title.blank?
      return render json: { error: 'Country and job_title parameters are required' }, status: :bad_request
    end

    stats = SalaryInsightsService.job_title_stats(country, job_title)

    render json: {
      country: country,
      job_title: job_title,
      **stats
    }
  end
end
