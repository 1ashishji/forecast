module Api
  module V1
    class EmployeesController < ApplicationController
  before_action :set_employee, only: %i[ show update destroy ]

  def index
    limit = (params[:limit] || 10).to_i
    
    if params[:cursor].present?
      @employees = Employee.where('id > ?', params[:cursor]).order(:id).limit(limit)
    else
      @employees = Employee.order(:id).limit(limit)
    end
    
    next_cursor = @employees.length == limit ? @employees.last.id : nil

    render json: {
      employees: @employees,
      next_cursor: next_cursor
    }
  end

  # GET /api/v1/employees/countries
  def countries
    render json: Employee.distinct.pluck(:country).sort
  end

  # GET /api/v1/employees/job_titles
  def job_titles
    render json: Employee.distinct.pluck(:job_title).sort
  end

  def show
    render json: @employee
  end

  def create
    @employee = Employee.new(employee_params)

    if @employee.save
      render json: @employee, status: :created, location: @employee
    else
      render json: @employee.errors, status: :unprocessable_entity
    end
  end

  def update
    if @employee.update(employee_params)
      render json: @employee
    else
      render json: @employee.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @employee.destroy!
    head :no_content
  end

  private
    def set_employee
      @employee = Employee.find(params[:id])
    end

    def employee_params
      params.require(:employee).permit(:first_name, :last_name, :email, :job_title, :country, :salary, :status)
    end
    end
  end
end
