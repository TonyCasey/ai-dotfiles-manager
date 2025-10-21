# Testing Rules

## 1. Test Structure

### Testing Pyramid
- **FOLLOW TESTING PYRAMID**: More unit tests, fewer integration tests, even fewer E2E tests
- Unit tests: 70% of tests
- Integration tests: 20% of tests
- End-to-end tests: 10% of tests

### Test Organization
```
tests/
├── unit/              # Unit tests (fast, isolated)
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── integration/       # Integration tests (slower, with real dependencies)
└── e2e/              # End-to-end tests (slowest, full system)
```

### Test File Naming
- Unit tests: `ClassName.test.ts` or `functionName.test.ts`
- Integration tests: `feature.integration.test.ts`
- E2E tests: `workflow.e2e.test.ts`
- Place tests in same directory structure as source

## 2. Test Quality Rules

### Use Describe/It Blocks
```typescript
describe('ProductService', () => {
  describe('getProductById', () => {
    it('should return product when it exists', async () => {
      // Arrange
      const productId = '123';
      const mockProduct = { id: productId, name: 'Test Product' };
      mockRepository.getById.mockResolvedValue(mockProduct);

      // Act
      const result = await service.getProductById(productId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockRepository.getById).toHaveBeenCalledWith(productId);
    });

    it('should throw error when product not found', async () => {
      // Arrange
      mockRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProductById('999')).rejects.toThrow(NotFoundError);
    });
  });
});
```

### Test Both Positive and Negative Cases
- **Happy path**: Test normal successful flow
- **Error cases**: Test all error conditions
- **Edge cases**: Test boundary conditions
- **Validation**: Test input validation

## 3. Test Data Management

### Use Fixtures
```typescript
// tests/fixtures/products.ts
export const mockProduct = {
  id: '123',
  name: 'Test Product',
  price: 99.99
};

export const mockProducts = [
  mockProduct,
  { id: '456', name: 'Another Product', price: 49.99 }
];
```

### Use Test Builders
```typescript
// tests/builders/ProductBuilder.ts
export class ProductBuilder {
  private product: Partial<Product> = {
    id: '123',
    name: 'Default Product',
    price: 10.00
  };

  withId(id: string): ProductBuilder {
    this.product.id = id;
    return this;
  }

  withName(name: string): ProductBuilder {
    this.product.name = name;
    return this;
  }

  build(): Product {
    return this.product as Product;
  }
}

// Usage in tests
const product = new ProductBuilder()
  .withId('custom-id')
  .withName('Custom Product')
  .build();
```

### Keep Test Data Consistent
- Use the same test data across related tests
- Create factory functions for complex objects
- Clean up test data after tests run

## 4. Mocking Rules

### Mock External Dependencies in Unit Tests
```typescript
describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPaymentService: jest.Mocked<IPaymentService>;

  beforeEach(() => {
    // Create mocks
    mockOrderRepository = {
      save: jest.fn(),
      getById: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<IOrderRepository>;

    mockPaymentService = {
      processPayment: jest.fn()
    } as jest.Mocked<IPaymentService>;

    // Inject mocks
    service = new OrderService(mockOrderRepository, mockPaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create order and process payment', async () => {
    // Test implementation
  });
});
```

### Don't Mock What You Don't Own
- Mock your interfaces, not third-party libraries
- Create wrapper interfaces for third-party code
- Test the wrappers separately

## 5. Integration Testing Rules

### Use Real Services
```typescript
describe('ProductRepository Integration', () => {
  let repository: ProductRepository;
  let databaseService: IDatabaseService;

  beforeAll(async () => {
    // Set up real database (or test database)
    databaseService = new DatabaseService(testConfig);
    await databaseService.connect();
    repository = new ProductRepository(databaseService);
  });

  afterAll(async () => {
    // Clean up
    await databaseService.disconnect();
  });

  beforeEach(async () => {
    // Clear data before each test
    await databaseService.clearCollection('products');
  });

  it('should save and retrieve product', async () => {
    // Test with real database operations
  });
});
```

### Test Real Integrations
- Test actual database operations
- Test external API calls (with test endpoints)
- Test file system operations (with temp directories)
- Verify integration contracts

## 6. Test Isolation

### Each Test Should Be Independent
```typescript
describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    // Create fresh instance for each test
    service = new CartService(mockRepository);
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  it('test 1', async () => {
    // This test doesn't affect other tests
  });

  it('test 2', async () => {
    // Fresh state
  });
});
```

### Clean Up After Tests
- Clear mocks in `afterEach`
- Close database connections in `afterAll`
- Delete temporary files
- Reset global state

## 7. Test Coverage

### What to Test
- ✅ All public methods
- ✅ All error paths
- ✅ All edge cases
- ✅ All validation logic
- ✅ Integration points

### What Not to Test
- ❌ Third-party library internals
- ❌ Framework code
- ❌ Simple getters/setters
- ❌ Generated code

### Coverage Goals
- Critical business logic: 95%+
- Services and repositories: 90%+
- Utilities: 80%+
- Overall project: 80%+

## 8. Test Performance

### Keep Tests Fast
- Unit tests should run in milliseconds
- Integration tests should run in seconds
- Use mocks to avoid slow operations
- Parallelize test execution

### Run Tests Frequently
- Run unit tests on every save
- Run all tests before commit
- Run full suite in CI/CD pipeline

## 9. Test Checklist

### Before Writing Tests
- [ ] Understand what you're testing
- [ ] Identify all cases to test (happy path, errors, edge cases)
- [ ] Plan test data needed
- [ ] Determine what needs to be mocked

### Writing Tests
- [ ] Use descriptive test names
- [ ] Follow Arrange-Act-Assert pattern
- [ ] Mock external dependencies
- [ ] Test one thing per test
- [ ] Include both positive and negative cases

### After Writing Tests
- [ ] All tests pass
- [ ] Tests are isolated (can run in any order)
- [ ] Tests are fast
- [ ] Code coverage is adequate
- [ ] Test code is clean and maintainable
