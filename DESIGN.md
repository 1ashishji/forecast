# Rails API Stabilization & Refactor — Engineering Approach & Outcomes

This document explains the thinking and step-by-step approach used to restore and modernize the Incubytes Employee Portal.

## 1. Problem Understanding
The application failed to boot due to gem conflicts and Redis misconfiguration. The goal was to restore stability, ensure safe database migrations, and introduce a scalable API structure.

## 2.  Approach (Step-by-step)
1.  **Fix gem dependency conflicts**: Resolved the `connection_pool` mismatch in the `Gemfile`.
2.  **Resolve Redis initialization error**: Traced the `ArgumentError` to environment-specific config issues.
3.  **Database Reconciliation**: Added safety guards to migrations to handle existing table states gracefully.
4.  **API Modernization**: Implemented Api::V1 namespace to provide a professional foundation for future scaling.
5.  **Frontend Sync**: Re-mapped React components to consume the new namespaced endpoints.

## 3. Design / Architecture (Simple)
*   **Infrastructure**: A containerized stack (Docker Compose) featuring Rails (Web), Sidekiq (Workers), Redis (Cache), and MySQL (DB).
*   **API Layer**: Implemented `Api::V1` namespace to provide a professional foundation for future scaling.
*   **Data Flow**: React Frontend → Vite Proxy (/api) → Rails Router → Namespaced Controllers → SalaryInsightsService.

## 4. Architectural Decisions & Trade-offs

### MySQL vs SQLite
- **Decision**: MySQL 8 was chosen as the primary database.
- **Rationale**: While SQLite is excellent for small projects, MySQL 8 provides superior support for high-concurrency environments and bulk data operations (like our `update_all` promotion logic). In a containerized setup, using a dedicated database service mirrors production environments more accurately and avoids the file-locking issues common with SQLite when handled by multiple processes (Web + Sidekiq).

### Keyset (Cursor) Pagination
- **Decision**: Implemented keyset pagination in `EmployeesController`.
- **Rationale**: Traditional `OFFSET` pagination becomes exponentially slower as the page number increases (O(n) complexity). Keyset pagination provides constant O(1) performance regardless of the table size, which is essential for a system designed to handle thousands or millions of employee records.

### Trade-offs
- **Temporary Production Mode**: I temporarily switched to production mode in the container to bypass a blocking Redis configuration issue and restore system access quickly. A proper long-term fix would involve resolving the root configuration conflict in the development environment.
- **Migration Safety Guards**: Added `return if table_exists?` to migrations. This avoids destructive `db:drop` actions while ensuring the app is bootable across different developer environments.
- **Direct SQL for Promotions**: Used `update_all` in `EmployeePromotionService`.
  - **Trade-off**: This bypasses ActiveRecord callbacks and validations. 
  - **Rationale**: For bulk updates (10,000+ records), the performance gain (1 query vs 10,000 queries) outweighs the need for individual record validations in this specific use case.

## 5. Performance Considerations
*   **Implemented Cursor Pagination**: Replaced traditional `OFFSET` with cursor-based pagination in `EmployeesController` to ensure constant O(1) performance as the dataset grows.
*   **Eager Loading**: Enabled Rails eager loading to minimize response latency after container startup.
*   **Database Indexing**: Ensured critical lookups (country, email) are backed by database indexes for sub-millisecond retrieval.

## 6. AI Usage
*   **Diagnostic Support**: Used AI for structure ideas and for identifying the specific version requirements for Sidekiq 8.
*   **Prompt Strategy**: Used targeted diagnostic prompts such as *"Analyze the stack trace of the RedisCacheStore initialization error in Rails 7.1."*

## 7. Future Improvements
*   **Environment Configuration**: Fix Redis configuration properly for the development environment.
*   **Automated Testing**: Add unit and integration tests for migrations and API endpoints.
*   **API Documentation**: Implement Swagger/OpenAPI for easier frontend-backend collaboration.
*   **Observability**: Improve structured logging and error reporting for better production monitoring.
