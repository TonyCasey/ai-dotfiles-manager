# Testing Guidelines

## Testing Philosophy

- Use dependency injection and mocking for unit tests
- Keep tests isolated with `beforeEach` and `afterEach`
- Test business logic, not data access implementation details
- Test error cases and edge cases
- Mock external dependencies (Firebase, APIs, etc.)

## Test File Structure

```
tests/
├── infrastructure/unit/
│   ├── ProductRepository.test.ts
│   ├── CartRepository.test.ts
│   └── OrderRepository.test.ts
├── application/unit/
│   ├── CartService.test.ts
│   └── OrderService.test.ts
└── application/integration/
    └── mocks/
        └── MockDatabaseService.ts
```

## Repository Tests

### Guidelines
- Use `MockDatabaseService` to avoid real database calls
- Test all CRUD operations
- Test error cases (not found, etc.)
- Keep tests isolated with `beforeEach` and `afterEach`

### Example Repository Test
```typescript
import { ProductRepository } from "../../../src/infrastructure/repositories/ProductRepository";
import { MockDatabaseService } from "../../application/integration/mocks/MockDatabaseService";
import { ProductNotFoundError } from "../../../src/domain/errors";

describe("ProductRepository", () => {
  let repository: ProductRepository;
  let mockDatabaseService: MockDatabaseService;

  beforeEach(() => {
    mockDatabaseService = new MockDatabaseService();
    repository = new ProductRepository(mockDatabaseService);
  });

  afterEach(() => {
    mockDatabaseService.reset();
  });

  it("should throw ProductNotFoundError when product does not exist", async () => {
    await expect(repository.getById("nonexistent")).rejects.toThrow(ProductNotFoundError);
  });

  it("should create and retrieve a product", async () => {
    const product = { name: "Test Product", price: 99.99 };
    await repository.create("prod1", product as IProduct);

    const retrieved = await repository.getById("prod1");
    expect(retrieved.name).toBe("Test Product");
  });

  it("should update a product", async () => {
    const product = { name: "Test Product", price: 99.99 };
    await repository.create("prod1", product as IProduct);

    await repository.update("prod1", { price: 149.99 });

    const updated = await repository.getById("prod1");
    expect(updated.price).toBe(149.99);
  });

  it("should delete a product", async () => {
    const product = { name: "Test Product", price: 99.99 };
    await repository.create("prod1", product as IProduct);

    await repository.delete("prod1");

    await expect(repository.getById("prod1")).rejects.toThrow(ProductNotFoundError);
  });

  it("should query products with filters", async () => {
    const product1 = { name: "Product 1", price: 99.99 };
    const product2 = { name: "Product 2", price: 149.99 };
    await repository.create("prod1", product1 as IProduct);
    await repository.create("prod2", product2 as IProduct);

    const results = await repository.query();
    expect(results.size).toBe(2);
  });
});
```

## Service Tests

### Guidelines
- Mock repository dependencies
- Test business logic, not data access
- Test error propagation
- Test edge cases and validation

### Example Service Test
```typescript
import { CartService } from "../../../src/application/services/CartService";
import { ProductNotFoundError, CartNotFoundError } from "../../../src/domain/errors";

describe("CartService", () => {
  let service: CartService;
  let mockCartRepo: jest.Mocked<ICartRepository>;
  let mockProductRepo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockCartRepo = {
      getById: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockProductRepo = {
      getById: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new CartService(mockCartRepo, mockProductRepo);
  });

  it("should throw ProductNotFoundError for invalid product", async () => {
    mockProductRepo.getById.mockRejectedValue(new ProductNotFoundError("invalid"));

    await expect(service.addToCart("cart1", "invalid", 1))
      .rejects.toThrow(ProductNotFoundError);
  });

  it("should add product to cart successfully", async () => {
    const mockProduct = { id: "p1", name: "Product 1", price: 99.99 };
    const mockCart = { id: "cart1", items: [], total: 0 };

    mockProductRepo.getById.mockResolvedValue(mockProduct as any);
    mockCartRepo.getById.mockResolvedValue(mockCart as any);
    mockCartRepo.update.mockResolvedValue();

    const cart = await service.addToCart("cart1", "p1", 1);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe("p1");
    expect(cart.total).toBe(99.99);
  });

  it("should calculate correct total for multiple items", async () => {
    const mockProduct1 = { id: "p1", name: "Product 1", price: 99.99 };
    const mockProduct2 = { id: "p2", name: "Product 2", price: 149.99 };
    const mockCart = { id: "cart1", items: [], total: 0 };

    mockCartRepo.getById.mockResolvedValue(mockCart as any);
    mockCartRepo.update.mockResolvedValue();
    mockProductRepo.getById
      .mockResolvedValueOnce(mockProduct1 as any)
      .mockResolvedValueOnce(mockProduct2 as any);

    await service.addToCart("cart1", "p1", 2);
    const cart = await service.addToCart("cart1", "p2", 1);

    expect(cart.total).toBe(349.97);
  });
});
```

## Test Isolation

### Use beforeEach and afterEach
```typescript
describe("MyService", () => {
  let service: MyService;
  let mockDependency: jest.Mocked<IDependency>;

  beforeEach(() => {
    // Set up fresh instances for each test
    mockDependency = {
      method: jest.fn(),
    } as any;

    service = new MyService(mockDependency);
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  it("should do something", () => {
    // Test is isolated from other tests
  });
});
```

### Don't Rely on Test Execution Order
```typescript
// BAD - Tests depend on each other
describe("ProductRepository", () => {
  it("should create a product", async () => {
    await repository.create("prod1", product);
  });

  it("should retrieve the product", async () => {
    // Assumes previous test ran first
    const product = await repository.getById("prod1");
  });
});

// GOOD - Each test is independent
describe("ProductRepository", () => {
  it("should create and retrieve a product", async () => {
    await repository.create("prod1", product);
    const retrieved = await repository.getById("prod1");
    expect(retrieved).toBeDefined();
  });
});
```

## Mocking External Dependencies

### Mock Repositories
```typescript
// Mock repository dependencies in service tests
const mockRepo: jest.Mocked<IProductRepository> = {
  getById: jest.fn(),
  query: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
} as any;

// Test business logic, not data access
mockRepo.getById.mockResolvedValue(productData);
```

### Use MockDatabaseService
```typescript
// Use MockDatabaseService in repository tests
const mockDatabase = new MockDatabaseService();
const repository = new ProductRepository(mockDatabase);

// Clean up after each test
afterEach(() => {
  mockDatabase.reset();
});
```

## Testing Error Cases

### Test Domain Error Propagation
```typescript
it("should propagate ProductNotFoundError", async () => {
  mockProductRepo.getById.mockRejectedValue(new ProductNotFoundError("invalid"));

  await expect(service.addToCart("cart1", "invalid", 1))
    .rejects.toThrow(ProductNotFoundError);
});

it("should throw validation error for invalid input", async () => {
  await expect(service.addToCart("", "", -1))
    .rejects.toThrow(InvalidParameterError);
});
```

### Test Edge Cases
```typescript
it("should handle empty arrays", async () => {
  const result = await service.processItems([]);
  expect(result).toEqual([]);
});

it("should handle null values", async () => {
  mockRepo.getById.mockResolvedValue(null);
  await expect(service.getItem("id")).rejects.toThrow();
});

it("should handle concurrent operations", async () => {
  const promises = [
    service.createItem("item1"),
    service.createItem("item2"),
    service.createItem("item3"),
  ];

  await expect(Promise.all(promises)).resolves.toBeDefined();
});
```

## Database Testing

### Important Notes
- Use database emulators or mocks for testing
- Environment variables should distinguish between test/production: `NODE_ENV`, `CORE_TESTS`
- Tests should use isolated database instances or in-memory stores
- Use cleanup utilities between tests: `clearDatabase()`, `resetTestData()`

### Database Service Architecture
Database operations use a factory pattern with test/production implementations:
- `DatabaseService` (production): Uses actual database client
- `MockDatabaseService` (testing): In-memory implementation for tests
- `DatabaseServiceFactory`: Returns correct implementation based on `CORE_TESTS` env var
- `getDatabaseService()`: Primary way to obtain DatabaseService instance

### Testing Pattern
```typescript
// Tests automatically use MockDatabaseService when CORE_TESTS=true
const databaseService = getDatabaseService(); // Returns mock in tests
```

## Mock Implementations

### Match Production Interfaces Exactly
```typescript
// Mock implementations should match production interfaces
export class MockDatabaseService implements IDatabaseService {
  // Implement ALL methods from IDatabaseService
  async readDocDataAtPath(path: string): Promise<any> {
    // Mock implementation
  }

  async createDocInCollection(path: string, data: any): Promise<void> {
    // Mock implementation
  }

  // ... all other methods
}
```

## Common Testing Pitfalls

1. **Not cleaning up between tests**: Always use `beforeEach` and `afterEach`
2. **Testing implementation details**: Focus on behavior, not internal implementation
3. **Forgetting to mock dependencies**: All external dependencies should be mocked
4. **Not testing error cases**: Test both happy path and error scenarios
5. **Relying on test execution order**: Each test should be independent
6. **Not updating mocks when interfaces change**: Keep mocks in sync with interfaces
