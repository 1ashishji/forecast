module Api
  module V1
    class EmployeesController < ApplicationController
      before_action :set_employee, only: %i[show update destroy]

      # GET /api/v1/employees
      def index
        limit = (params[:limit] || 10).to_i
        @employees = params[:cursor].present? ? 
          Employee.where('id > ?', params[:cursor]).order(:id).limit(limit) : 
          Employee.order(:id).limit(limit)
        
        next_cursor = (@employees.length == limit) ? @employees.last.id : nil
        render json: { employees: @employees, next_cursor: next_cursor }
      end

      # GET /api/v1/employees/countries
      def countries
        render json: Employee.distinct.pluck(:country).sort
      end

      # GET /api/v1/employees/job_titles
      def job_titles
        render json: Employee.distinct.pluck(:job_title).sort
      end

      # GET /api/v1/employees/:id
      def show
        render json: @employee
      end

      # POST /api/v1/employees
      def create
        # Handle both flat and nested JSON payloads
        data = params.key?(:employee) ? employee_params : flat_params
        @employee = Employee.new(data)

        if @employee.save
          render json: @employee, status: :created
        else
          render json: { errors: @employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/employees/:id
      def update
        data = params.key?(:employee) ? employee_params : flat_params
        if @employee.update(data)
          render json: @employee
        else
          render json: { errors: @employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/employees/:id
      def destroy
        @employee.destroy!
        head :no_content
      end

      private

      def set_employee
        # Defensive Routing: Guard against collection paths matching as IDs
        return if %w[countries job_titles].include?(params[:id])
        @employee = Employee.find(params[:id])
      end

      def employee_params
        params.require(:employee).permit(:full_name, :job_title, :country, :salary, :currency, :department_id)
      end

      def flat_params
        params.permit(:full_name, :job_title, :country, :salary, :currency, :department_id)
      end
    end
  end
end
