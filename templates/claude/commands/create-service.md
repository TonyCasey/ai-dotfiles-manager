You are tasked with creating a new application service following the Clean Architecture pattern.

When creating a service, you MUST follow these steps exactly:

1. Ask the user for:
   - Service name (e.g., "Cart", "Order", "Checkout")
   - List of methods the service should have with descriptions
   - Repository dependencies (e.g., ICartRepository, IProductRepository)

2. Create the service interface in `src/application/interfaces/I{Name}Service.ts` with:
   - All methods specified by the user
   - JSDoc comments for each method
   - Proper return types and parameters

3. Implement the service in `src/application/services/{Name}Service.ts` with:
   - Constructor injection of all repository dependencies
   - `private readonly` for all injected dependencies
   - Business logic implementation for each method
   - Proper error handling with domain errors
   - Input validation where appropriate

4. Export from appropriate indices:
   - `src/application/interfaces/index.ts`
   - `src/application/services/index.ts`

5. Register with DI container in `src/infrastructure/di/DIRegistration.ts`:
   - Add token: `export const {NAME}_SERVICE_TOKEN = '{Name}Service';`
   - Register in appropriate function (e.g., `registerServices()`)
   - Resolve all repository dependencies

6. Create test file `tests/application/unit/{Name}Service.test.ts` with:
   - Mock all repository dependencies using `jest.Mocked<>`
   - Tests for all methods
   - Tests for error cases
   - Tests for edge cases and validation
   - Use `beforeEach` to set up mocks and service instance

7. If the service needs configuration interfaces, create them in `src/application/interfaces/I{Name}Config.ts` and export from the layer index

After creating all files, provide a summary of what was created and example usage code.
