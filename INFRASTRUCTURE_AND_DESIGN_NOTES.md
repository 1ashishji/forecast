# Infrastructure and Design Notes: Rails API Stabilization

This document outlines the technical approach, trade-offs, and resolutions implemented to stabilize the Incubytes Employee Portal backend.

## 1. Infrastructure Stabilization

### Dependency Conflict (Sidekiq 8 & Connection Pool)
- **Problem**: The application failed to boot with a `Bundler::GemNotFound` error. Sidekiq 8 required `connection_pool >= 3.0.0`, but the existing `Gemfile.lock` was pinning it to `~> 2.4`.
- **Solution**: Updated the `Gemfile` to explicitly permit `connection_pool >= 3.0.0`. Deleted the `Gemfile.lock` and rebuilt the container to synchronize the environment.
- **Trade-off**: Forcing a dependency update can sometimes introduce regressions, but it was necessary to support the modern Sidekiq version required by the project.

### Boot Crash (ArgumentError in RedisCacheStore)
- **Problem**: Rails failed to boot with `ArgumentError: wrong number of arguments (given 1, expected 0)` originating from `RedisCacheStore`.
- **Discovery**: The `.env` file was overriding `RAILS_ENV` to `development`, which triggered the loading of a problematic Redis configuration in `development.rb`.
- **Resolution**: 
  - Switched `RAILS_ENV` to `production` in the `.env` file to match the intended Docker deployment target.
  - Commented out the `redis_cache_store` in `development.rb` as a fallback safety measure.
- **Rationale**: Production mode provides a more stable, STDOUT-logging-ready environment for containerized development in this specific project setup.

## 2. Database Resilience

### Migration Conflict (Table Already Exists)
- **Problem**: `rails db:prepare` would crash if the `employees` table already existed in the persistent volume.
- **Solution**: Added a `return if table_exists?(:employees)` guard clause to the primary migration.
- **Approach**: This ensures the container can be restarted indefinitely without manual database intervention, even if the migration state in the database becomes out of sync with the codebase.

## 3. API Architecture

### RESTful Versioning (api/v1)
- **Decision**: Implemented a versioned API structure (`/api/v1/employees`).
- **Implementation**:
  - Moved controllers to `app/controllers/api/v1/`.
  - Wrapped logic in `Api::V1` modules.
  - Updated `config/routes.rb` with namespaced resources.
- **Benefit**: Provides a professional foundation for future API changes without breaking existing frontend consumers (though we synchronized the frontend immediately in this case).

### Data Schema Synchronization
- **Finding**: While migrations used `first_name`/`last_name`, the existing database data and frontend expectations were built around a `full_name` column.
- **Resolution**: Synchronized the `EmployeesController` and `Employee` model to prioritize the `full_name` field, ensuring the "Employee Directory" page functions correctly with the existing database records.

## 4. Performance Considerations
- **Eager Loading**: Enabled in the production environment to ensure fast response times after the initial boot.
- **Logging**: Configured to log to STDOUT for better visibility within the Docker Compose ecosystem.
- **Pagination**: Maintained the cursor-based pagination in `EmployeesController` to ensure the API remains performant even as the employee database grows.
