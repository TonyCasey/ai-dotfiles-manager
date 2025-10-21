# Error Handling Rules

## 1. Domain Error Classes

### Create Domain-Specific Errors
```typescript
// src/domain/errors/DomainError.ts
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// src/domain/errors/NotFoundError.ts
export class NotFoundError extends DomainError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 404, data);
  }
}

// src/domain/errors/ValidationError.ts
export class ValidationError extends DomainError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 400, data);
  }
}
```

### Error Hierarchy
- All domain errors extend `DomainError`
- `DomainError` extends native `Error`
- Include HTTP status codes
- Provide error-specific data

## 2. Error Handling Patterns

### Always Use Try-Catch
```typescript
// GOOD - Proper error handling
async function processOrder(orderId: string): Promise<Order> {
  try {
    const order = await orderRepository.getById(orderId);
    if (!order) {
      throw new NotFoundError(`Order not found: ${orderId}`);
    }
    return order;
  } catch (error) {
    logger.error('Failed to process order', { error, orderId });
    throw error; // Re-throw or transform
  }
}

// BAD - No error handling
async function processOrder(orderId: string): Promise<Order> {
  const order = await orderRepository.getById(orderId); // What if it fails?
  return order;
}
```

### Transform Errors at Layer Boundaries
```typescript
// Infrastructure layer
export class ProductRepository implements IProductRepository {
  async getById(id: string): Promise<Product | null> {
    try {
      const doc = await this.db.collection('products').doc(id).get();
      return doc.exists ? doc.data() as Product : null;
    } catch (error) {
      // Transform database error to domain error
      throw new RepositoryError(
        `Failed to fetch product: ${id}`,
        { originalError: error }
      );
    }
  }
}

// Application layer
export class ProductService implements IProductService {
  async getProduct(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new NotFoundError(`Product not found: ${id}`);
      }
      return product;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error; // Already a domain error
      }
      // Transform to service error
      throw new ServiceError(
        'Product retrieval failed',
        { originalError: error }
      );
    }
  }
}
```

## 3. Error Context

### Include Relevant Data
```typescript
// GOOD - Rich error context
throw new ValidationError(
  'Invalid order data',
  {
    orderId,
    userId,
    validationErrors: errors,
    timestamp: new Date().toISOString()
  }
);

// BAD - No context
throw new Error('Invalid order');
```

### Log Before Throwing
```typescript
try {
  await this.processPayment(order);
} catch (error) {
  // Log with context
  logger.error('Payment processing failed', {
    error,
    orderId: order.id,
    amount: order.total,
    paymentMethod: order.paymentMethod
  });
  throw new PaymentError(
    'Payment processing failed',
    { orderId: order.id }
  );
}
```

## 4. Error Factory Pattern

### Centralize Error Creation
```typescript
// src/domain/errors/OrderErrorFactory.ts
export class OrderErrorFactory {
  static createNotFoundError(orderId: string): NotFoundError {
    return new NotFoundError(
      `Order not found: ${orderId}`,
      { orderId }
    );
  }

  static createInvalidStateError(
    orderId: string,
    currentState: string,
    expectedState: string
  ): ValidationError {
    return new ValidationError(
      `Invalid order state transition`,
      { orderId, currentState, expectedState }
    );
  }

  static createPaymentError(
    orderId: string,
    reason: string
  ): PaymentError {
    return new PaymentError(
      `Payment failed for order: ${orderId}`,
      { orderId, reason }
    );
  }
}

// Usage
if (!order) {
  throw OrderErrorFactory.createNotFoundError(orderId);
}
```

## 5. Error Recovery

### Provide Fallbacks When Appropriate
```typescript
async function getProductWithFallback(id: string): Promise<Product> {
  try {
    return await this.productRepository.getById(id);
  } catch (error) {
    logger.warn('Failed to get product from primary source', { error, id });

    // Try cache
    try {
      const cached = await this.cache.get(id);
      if (cached) {
        return cached;
      }
    } catch (cacheError) {
      logger.error('Cache lookup failed', { cacheError, id });
    }

    // No recovery possible
    throw new NotFoundError(`Product not found: ${id}`);
  }
}
```

### Retry Transient Failures
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientError(error)) {
        throw error; // Don't retry permanent failures
      }
      await delay(Math.pow(2, attempt) * 1000); // Exponential backoff
    }
  }

  throw lastError;
}
```

## 6. Error Exports

### Export Errors from Index
```typescript
// src/domain/errors/index.ts
export { DomainError } from './DomainError';
export { NotFoundError } from './NotFoundError';
export { ValidationError } from './ValidationError';
export { AuthenticationError } from './AuthenticationError';
export { AuthorizationError } from './AuthorizationError';
export { OrderErrorFactory } from './OrderErrorFactory';
```

## 7. HTTP Status Codes

### Use Appropriate Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (Validation errors)
- **401**: Unauthorized (Authentication failed)
- **403**: Forbidden (Authorization failed)
- **404**: Not Found
- **409**: Conflict (State errors)
- **500**: Internal Server Error
- **503**: Service Unavailable

```typescript
export class NotFoundError extends DomainError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 404, data);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 400, data);
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 401, data);
  }
}
```

## 8. Error Testing

### Test All Error Cases
```typescript
describe('OrderService', () => {
  it('should throw NotFoundError when order does not exist', async () => {
    mockRepository.getById.mockResolvedValue(null);

    await expect(service.getOrder('999')).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError for invalid input', async () => {
    const invalidOrder = { items: [] };

    await expect(service.createOrder(invalidOrder)).rejects.toThrow(ValidationError);
  });

  it('should include error context', async () => {
    mockRepository.getById.mockResolvedValue(null);

    try {
      await service.getOrder('999');
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.data).toEqual({ orderId: '999' });
      expect(error.statusCode).toBe(404);
    }
  });
});
```
