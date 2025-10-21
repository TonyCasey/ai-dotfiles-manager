# TypeScript Conventions

## Interface Organization

### Naming and File Structure Rules

**Critical Rules** (these are enforced project standards):
1. **All interfaces must be in separate files** - No grouping multiple interfaces in one file
2. **All interface files must be prefixed with "I"** - e.g., `ICartService.ts`
3. **File name must match the interface name** - `ICartService.ts` contains `ICartService`
4. **One interface per file** - Single responsibility at the file level

### Directory Structure by Layer

```
src/domain/interfaces/
├── IAuthService.ts
├── IEmailService.ts
├── IRepository.ts
└── index.ts

src/application/interfaces/
├── ICartService.ts
├── IOrderService.ts
├── ICheckoutConfig.ts
├── IAddToCartConfig.ts
├── IProductDetails.ts
├── IShippingConfig.ts
└── index.ts

src/infrastructure/interfaces/
├── IDatabaseService.ts
├── IPaymentGatewayOptions.ts
├── IShippingConfig.ts
├── ISearchResult.ts
└── payments/
    └── providers/
        ├── stripe/
        │   ├── IStripeChargeConfig.ts
        │   ├── IStripeRefundConfig.ts
        │   └── IStripeWebhookConfig.ts
        ├── paypal/
        │   ├── IPayPalChargeConfig.ts
        │   └── IPayPalRefundConfig.ts
        └── inventory/
            ├── IStockUpdateConfig.ts
            └── IInventoryReservationConfig.ts
```

## Import Best Practices

### 1. Import from Specific Files for Single Interfaces
```typescript
// GOOD - Clear and explicit
import { ICartService } from '../application/interfaces/ICartService';

// AVOID - Harder to trace dependencies
import { ICartService } from '../application/interfaces';
```

### 2. Import from Layer Index for Multiple Interfaces
```typescript
// GOOD when importing multiple from same layer
import {
  ICartService,
  IOrderService,
  ICheckoutConfig
} from '../application/interfaces';
```

### 3. Use Main Index for External Consumers
```typescript
// GOOD for packages consuming the library
import { ICartService, IAuthService, IDatabaseService } from '@your-org/my-project';
```

### 4. Never Import from Utils When Layer Equivalent Exists
```typescript
// BAD - Old pattern
import { IProductCatalog } from '../utils/products/types';

// GOOD - Clean architecture pattern
import { IProductCatalog } from '../application/interfaces/IProductCatalog';
```

## Type Safety

### Type System Approach

1. **External Types**: Extensive use of interfaces from `@your-org/types` package for shared domain models (IProduct, ICart, IOrder, etc.)

2. **Path-Based Validation**: Use validation functions to enforce type safety based on document paths:
```typescript
// Validates that data matches the expected interface
await createDocInCollection('products/123', productData);
```

3. **Layer-Based Type Organization**: All internal interfaces organized by architectural layer (domain/application/infrastructure) for clear separation of concerns

4. **Strict TypeScript Configuration**:
   - `strict: true` in tsconfig.json
   - All type errors must be resolved before compilation
   - No `any` types in new code (use proper interfaces)

## Domain Errors

All errors should extend `DomainError` for consistent error handling with HTTP status codes.

### Available Error Classes
```typescript
import {
  DomainError,          // Base class
  ProductNotFoundError,  // 404
  CartNotFoundError,    // 404
  InvalidParameterError, // 400
  ProductOutOfStockError, // 409
  CartEmptyError // 400
} from '@your-org/my-project';
```

### Creating a New Domain Error
```typescript
// src/domain/errors/CartEmptyError.ts
import { DomainError } from "./DomainError";

export class CartEmptyError extends DomainError {
  constructor(cartId: string, details?: Record<string, unknown>) {
    super(
      `Cart ${cartId} is empty`,
      "CART_EMPTY",
      400,
      { cartId, ...details }
    );
  }
}
```

### Using Domain Errors in Repositories
```typescript
async getById(productId: string): Promise<IProduct> {
  const product = await this.databaseService.readDocDataAtPath(`products/${productId}`);
  if (!product) {
    throw new ProductNotFoundError(productId);  // Throws 404 error
  }
  return product;
}
```

### Using Domain Errors in Services
```typescript
async validateCart(cartId: string): Promise<void> {
  const cart = await this.cartRepository.getById(cartId);

  if (!cart.items || cart.items.length === 0) {
    throw new CartEmptyError(cartId);
  }

  if (cart.total <= 0) {
    throw new CartEmptyError(cartId, { reason: "Cart total must be positive" });
  }
}
```

### Error Properties
- `message`: Human-readable error message
- `code`: Machine-readable error code (e.g., "PRODUCT_NOT_FOUND")
- `statusCode`: HTTP status code (404, 400, etc.)
- `details`: Additional context (productId, cartId, etc.)
- `stack`: Error stack trace

### Throw Domain Errors from Repositories
```typescript
// GOOD - Specific domain error
if (!product) {
  throw new ProductNotFoundError(productId);
}

// BAD - Generic error
if (!product) {
  throw new Error(`Product not found: ${productId}`);
}
```

## Export Organization

### Layer Indices
Each layer should have an `index.ts` that exports all public interfaces:

```typescript
// src/domain/interfaces/index.ts
export { IProductRepository } from './IProductRepository';
export { ICartRepository } from './ICartRepository';
export { IAuthService } from './IAuthService';

// src/application/interfaces/index.ts
export { ICartService } from './ICartService';
export { IOrderService } from './IOrderService';
export { ICheckoutConfig } from './ICheckoutConfig';

// src/infrastructure/interfaces/index.ts
export { IDatabaseService } from './IDatabaseService';
export { IPaymentGatewayOptions } from './IPaymentGatewayOptions';
```

### Main Index
The main `src/index.ts` file explicitly exports from each layer:

```typescript
// Application layer exports
export {
  ICartService,
  IOrderService,
  ICheckoutConfig,
  // ... use cases and configs
} from './application/interfaces';

// Domain layer exports
export {
  IAuthService,
  IEmailService,
  IProductRepository,
  ICartRepository
} from './domain/interfaces';

// Infrastructure layer exports
export {
  IDatabaseService,
  IPaymentGatewayOptions,
  // ... external system interfaces
} from './infrastructure/interfaces';
```

This organization:
- Makes it clear which layer each interface belongs to
- Prevents accidental exposure of internal interfaces
- Provides a clean public API for package consumers

## Common Pitfalls to Avoid

1. **Importing from types.ts**: These files are deprecated. Import from `interfaces/I*.ts` instead
2. **Forgetting to export**: Add new interfaces to layer index.ts and main index.ts
3. **Not updating mocks**: When changing interfaces, update corresponding mock implementations
4. **Using `any` type**: Always use proper interfaces for type safety
5. **Grouping interfaces**: Keep one interface per file with matching names
