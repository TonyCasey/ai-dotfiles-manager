# Code Quality Standards

## 1. TypeScript Specific Rules

### Type Safety
- **USE STRICT MODE** always (`"strict": true` in tsconfig.json)
- **NEVER use `any` types** - always use specific types
- Use explicit types over inference for public APIs
- Use interfaces for object shapes
- Implement proper generic constraints

### Naming Conventions
- **Interfaces**: Prefix with 'I' (e.g., `IProductService`, `IRepository`)
- **Classes**: PascalCase (e.g., `ProductService`, `CartRepository`)
- **Files**: Match the main export (e.g., `IProductService.ts`, `ProductService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Variables/Functions**: camelCase (e.g., `getUserById`, `productList`)

### File Organization
- **One interface per file** in interfaces directories
- **One class per file** for services and repositories
- File name must match the interface/class name
- Export from index files for clean imports

## 2. Code Structure Rules

### Interface Design
```typescript
// GOOD - Small, focused interface
export interface IProductRepository {
  getById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}

// BAD - Large, unfocused interface
export interface IProductService {
  // 50+ methods doing everything
}
```

### Constructor Injection
```typescript
// GOOD - Dependencies injected via constructor
export class ProductService implements IProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly logger: ILogger
  ) {}
}

// BAD - Dependencies created internally
export class ProductService implements IProductService {
  private productRepository = new ProductRepository();
}
```

### Method Design
- Keep methods small and focused (< 50 lines ideal)
- One level of abstraction per method
- Use descriptive names that indicate purpose
- Return early to reduce nesting

## 3. Error Handling Rules

### Always Handle Errors
```typescript
// GOOD - Proper error handling
try {
  const result = await this.processData(input);
  return result;
} catch (error) {
  this.logger.error('Failed to process data', { error, input });
  throw new ProcessingError(
    'Data processing failed',
    { originalError: error }
  );
}

// BAD - No error handling
async processData(input) {
  const result = await someOperation(); // No try-catch
  return result;
}
```

### Use Domain Errors
- Extend `DomainError` base class for domain errors
- Provide meaningful error messages
- Include relevant context in error data
- Set appropriate HTTP status codes

### Error Propagation
- Don't swallow errors silently
- Log errors at appropriate levels
- Transform errors at layer boundaries
- Preserve original error context

## 4. Testing Requirements

### Test Structure
- **FOLLOW TESTING PYRAMID**: More unit tests, fewer integration tests
- Unit tests in `tests/unit/` following source structure
- Integration tests in `tests/integration/`
- End-to-end tests in `tests/e2e/`

### Test Quality
- Write tests first (TDD approach) when possible
- Test both positive and negative cases
- Use descriptive test names
- Mock external dependencies in unit tests
- Use real services in integration tests

### Test Coverage
- Aim for high coverage (90%+ for critical paths)
- All repositories must have tests
- All services must have tests
- All error cases must be tested

## 5. Code Review Checklist

### Before Submitting
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All tests passing
- [ ] No `any` types used
- [ ] Proper error handling implemented
- [ ] Constructor injection used
- [ ] Interfaces properly defined
- [ ] Code follows SOLID principles
- [ ] Documentation updated

## 6. Examples

### ✅ Good Practices
```typescript
// Proper dependency injection
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentService: IPaymentService,
    private readonly logger: ILogger
  ) {}

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      // Validate request
      this.validateRequest(request);

      // Create order
      const order = Order.create(request);

      // Save order
      await this.orderRepository.save(order);

      this.logger.info('Order created', { orderId: order.id });
      return order;
    } catch (error) {
      this.logger.error('Failed to create order', { error, request });
      throw OrderErrorFactory.createOrderCreationError(
        'Order creation failed',
        { originalError: error }
      );
    }
  }

  private validateRequest(request: CreateOrderRequest): void {
    if (!request.items || request.items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }
  }
}
```

### ❌ Avoid These Practices
```typescript
// Don't use concrete dependencies
export class OrderService {
  constructor(
    private orderRepository: OrderRepository, // Concrete type
    private paymentService: PaymentService // Concrete type
  ) {}
}

// Don't use any types
async processData(data: any): any {
  return data.something;
}

// Don't ignore error handling
async createOrder(request) {
  const order = await this.orderRepository.save(request);
  return order; // What if it fails?
}

// Don't create god classes
export class EverythingService {
  // 100+ methods doing everything
}

// Don't create versioned files
// OrderService-v2.ts, Order-new.ts, Order-backup.ts
```

## 7. Performance Considerations

### Async/Await
- Always use async/await over raw promises
- Handle promise rejections properly
- Don't await in loops unless necessary (use Promise.all)

### Memory Management
- Clean up resources in finally blocks
- Avoid memory leaks from event listeners
- Use proper cleanup in tests (afterEach/afterAll)

### Database Operations
- Use repositories for all data access
- Batch operations when possible
- Use transactions for multi-step operations
- Handle connection pooling properly
