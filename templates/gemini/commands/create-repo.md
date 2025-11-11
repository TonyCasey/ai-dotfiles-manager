You are tasked with creating a new repository following the Clean Architecture pattern.

When creating a repository, you MUST follow these steps exactly:

1. Ask the user for:
   - Repository name (e.g., "Product", "Cart", "Order")
   - Database collection path (e.g., "products", "carts", "orders")
   - Whether a domain error class should be created (default: yes)

2. Create the repository interface in `src/domain/interfaces/I{Name}Repository.ts` with these methods:
   - `getById(id: string): Promise<I{Name}>`
   - `query(config?: IReadDocsConfig): Promise<Map<string, I{Name}>>`
   - `update(id: string, data: Partial<I{Name}>): Promise<void>`
   - `create(id: string, data: I{Name}): Promise<void>`
   - `delete(id: string): Promise<void>`

3. If domain error should be created, create `src/domain/errors/{Name}NotFoundError.ts` extending `DomainError` with status code 404

4. Implement the repository in `src/infrastructure/repositories/{Name}Repository.ts` with:
   - Constructor injection of `IDatabaseService`
   - Throw domain error in `getById` if not found
   - Use correct database collection path

5. Export from appropriate indices:
   - `src/domain/interfaces/index.ts`
   - `src/domain/errors/index.ts` (if error created)
   - `src/infrastructure/repositories/index.ts`

6. Register with DI container in `src/infrastructure/di/DIRegistration.ts`:
   - Add token: `export const {NAME}_REPOSITORY_TOKEN = '{Name}Repository';`
   - Register in `registerRepositories()` function

7. Create test file `tests/infrastructure/unit/{Name}Repository.test.ts` with tests for:
   - All CRUD operations
   - Error cases (not found)
   - Using `MockDatabaseService`

After creating all files, provide a summary of what was created and next steps.
