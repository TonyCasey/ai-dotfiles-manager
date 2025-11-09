You are tasked with creating comprehensive test files for repositories or services.

When creating tests, you MUST follow these steps:

1. Ask the user for:
   - What is being tested (Repository or Service)
   - Name of the class/interface
   - Path to the implementation file

2. For Repository Tests:
   - Create file: `tests/infrastructure/unit/{Name}Repository.test.ts`
   - Use `MockDatabaseService` as the dependency
   - Include `beforeEach` to set up fresh instances
   - Include `afterEach` to call `mockDatabaseService.reset()`
   - Test all CRUD methods (getById, query, update, create, delete)
   - Test error cases (especially NotFound errors)
   - Test edge cases

3. For Service Tests:
   - Create file: `tests/application/unit/{Name}Service.test.ts`
   - Mock all repository dependencies using `jest.Mocked<>`
   - Include `beforeEach` to set up mocks and service instance
   - Include `afterEach` to clear all mocks
   - Test all service methods
   - Test error propagation
   - Test business logic validation
   - Test edge cases

4. Test Structure Template:

```typescript
import { {Name} } from "../../../src/.../{ Name}";
import { MockDependency } from "../../mocks/MockDependency";
import { ExpectedError } from "../../../src/domain/errors";

describe("{Name}", () => {
  let instance: {Name};
  let mockDependency: MockDependency;

  beforeEach(() => {
    mockDependency = new MockDependency();
    instance = new {Name}(mockDependency);
  });

  afterEach(() => {
    mockDependency.reset(); // or jest.clearAllMocks()
  });

  describe("methodName", () => {
    it("should handle happy path", async () => {
      // Arrange
      const expected = { /* ... */ };
      mockDependency.method.mockResolvedValue(expected);

      // Act
      const result = await instance.methodName();

      // Assert
      expect(result).toBeDefined();
      expect(mockDependency.method).toHaveBeenCalledWith(/* ... */);
    });

    it("should throw error when...", async () => {
      // Arrange
      mockDependency.method.mockRejectedValue(new ExpectedError("id"));

      // Act & Assert
      await expect(instance.methodName()).rejects.toThrow(ExpectedError);
    });

    it("should handle edge case", async () => {
      // Test edge cases like empty arrays, null values, etc.
    });
  });
});
```

5. Best Practices to Include:
   - Each test should be independent
   - Use descriptive test names ("should ... when ...")
   - Follow Arrange-Act-Assert pattern
   - Test both success and failure paths
   - Mock external dependencies
   - Don't test implementation details

After creating tests, provide:
- Summary of test coverage
- Suggestions for additional test cases
- How to run the tests
