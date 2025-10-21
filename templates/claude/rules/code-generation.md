# Code Generation Guidelines

## Creating a New Repository

Use repositories for all data access operations. Follow these steps:

### Step 1: Define the Repository Interface in Domain Layer

```typescript
// src/domain/interfaces/IProductRepository.ts
export interface IProductRepository {
  /**
   * Retrieves a product by ID
   * @throws ProductNotFoundError if product doesn't exist
   */
  getById(productId: string): Promise<IProduct>;

  /**
   * Queries products with filters
   */
  query(config?: IReadDocsConfig): Promise<Map<string, IProduct>>;

  /**
   * Updates product data
   */
  update(productId: string, data: Partial<IProduct>): Promise<void>;

  /**
   * Creates a new product
   */
  create(productId: string, data: IProduct): Promise<void>;

  /**
   * Deletes a product
   */
  delete(productId: string): Promise<void>;
}
```

### Step 2: Create Domain Error Class (if needed)

```typescript
// src/domain/errors/ProductNotFoundError.ts
import { DomainError } from "./DomainError";

export class ProductNotFoundError extends DomainError {
  constructor(productId: string, details?: Record<string, unknown>) {
    super(
      `Product not found: ${productId}`,
      "PRODUCT_NOT_FOUND",
      404,
      { productId, ...details }
    );
  }
}
```

### Step 3: Implement the Repository in Infrastructure Layer

```typescript
// src/infrastructure/repositories/ProductRepository.ts
import { IProduct } from "@your-org/types";
import { IProductRepository } from "../../domain/interfaces/IProductRepository";
import { IDatabaseService } from "../interfaces/IDatabaseService";
import { ProductNotFoundError } from "../../domain/errors";

export class ProductRepository implements IProductRepository {
  constructor(private readonly databaseService: IDatabaseService) {}

  async getById(productId: string): Promise<IProduct> {
    const product = await this.databaseService.readDocDataAtPath(`products/${productId}`);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    return product;
  }

  async query(config?: import("@your-org/types").IReadDocsConfig): Promise<Map<string, IProduct>> {
    return this.databaseService.readDocsData("products", config);
  }

  async update(productId: string, data: Partial<IProduct>): Promise<void> {
    await this.databaseService.updateDocInCollection(`products/${productId}`, data);
  }

  async create(productId: string, data: IProduct): Promise<void> {
    await this.databaseService.createDocInCollection(`products/${productId}`, data);
  }

  async delete(productId: string): Promise<void> {
    await this.databaseService.recursiveDeleteDoc(`products/${productId}`);
  }
}
```

### Step 4: Export from Appropriate Indices

```typescript
// src/domain/interfaces/index.ts
export { IProductRepository } from './IProductRepository';

// src/domain/errors/index.ts
export { ProductNotFoundError } from "./ProductNotFoundError";

// src/infrastructure/repositories/index.ts
export { ProductRepository } from "./ProductRepository";
```

### Step 5: Register with DI Container

```typescript
// src/infrastructure/di/DIRegistration.ts

// Add token
export const PRODUCT_REPOSITORY_TOKEN = 'ProductRepository';

// In registerRepositories() function:
container.registerSingleton(PRODUCT_REPOSITORY_TOKEN, () => {
  const databaseService = container.resolve<IDatabaseService>('IDatabaseService');
  return new ProductRepository(databaseService);
});

container.registerSingleton<IProductRepository>(
  'IProductRepository',
  () => container.resolve(PRODUCT_REPOSITORY_TOKEN)
);
```

### Step 6: Write Tests

```typescript
// tests/infrastructure/unit/ProductRepository.test.ts
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

  // Add more tests for each method...
});
```

## Creating a New Service

Services contain business logic and orchestrate repositories. Use constructor dependency injection.

### Step 1: Define the Service Interface in Application Layer

```typescript
// src/application/interfaces/ICartService.ts
import { ICart, ICartItem } from "@your-org/types";

export interface ICartService {
  /**
   * Adds a product to the cart
   */
  addToCart(cartId: string, productId: string, quantity: number): Promise<ICart>;

  /**
   * Retrieves a cart by ID
   */
  getCart(cartId: string): Promise<ICart>;

  /**
   * Removes an item from the cart
   */
  removeFromCart(cartId: string, productId: string): Promise<void>;

  /**
   * Clears all items from the cart
   */
  clearCart(cartId: string): Promise<void>;
}
```

### Step 2: Implement the Service

```typescript
// src/application/services/CartService.ts
import { ICart, ICartItem } from "@your-org/types";
import { ICartService } from "../interfaces/ICartService";
import { ICartRepository } from "../../domain/interfaces/ICartRepository";
import { IProductRepository } from "../../domain/interfaces/IProductRepository";
import { CartNotFoundError, ProductNotFoundError } from "../../domain/errors";

export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async addToCart(cartId: string, productId: string, quantity: number): Promise<ICart> {
    // Verify product exists
    const product = await this.productRepository.getById(productId);

    // Get or create cart
    let cart: ICart;
    try {
      cart = await this.cartRepository.getById(cartId);
    } catch (error) {
      if (error instanceof CartNotFoundError) {
        cart = { id: cartId, items: [], total: 0 };
      } else {
        throw error;
      }
    }

    // Add item to cart
    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price: product.price });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Save cart
    await this.cartRepository.update(cartId, cart);
    return cart;
  }

  async getCart(cartId: string): Promise<ICart> {
    return await this.cartRepository.getById(cartId);
  }

  async removeFromCart(cartId: string, productId: string): Promise<void> {
    const cart = await this.cartRepository.getById(cartId);
    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await this.cartRepository.update(cartId, cart);
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await this.cartRepository.getById(cartId);
    cart.items = [];
    cart.total = 0;
    await this.cartRepository.update(cartId, cart);
  }
}
```

### Step 3: Export from Indices

```typescript
// src/application/interfaces/index.ts
export { ICartService } from './ICartService';

// src/application/services/index.ts
export { CartService } from "./CartService";
```

### Step 4: Register with DI Container

```typescript
// src/infrastructure/di/DIRegistration.ts

// Add token
export const CART_SERVICE_TOKEN = 'CartService';

// In registerServices() function:
container.registerSingleton(CART_SERVICE_TOKEN, () => {
  const cartRepo = container.resolve<ICartRepository>('ICartRepository');
  const productRepo = container.resolve<IProductRepository>('IProductRepository');
  return new CartService(cartRepo, productRepo);
});

container.registerSingleton<ICartService>(
  'ICartService',
  () => container.resolve(CART_SERVICE_TOKEN)
);
```

### Step 5: Write Service Tests

```typescript
// tests/application/unit/CartService.test.ts
import { CartService } from "../../../src/application/services/CartService";
import { ProductNotFoundError, CartNotFoundError } from "../../../src/domain/errors";

describe("CartService", () => {
  let service: CartService;
  let mockCartRepo: jest.Mocked<ICartRepository>;
  let mockProductRepo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockCartRepo = {
      getById: jest.fn(),
      update: jest.fn(),
      // ... other methods
    } as any;

    mockProductRepo = {
      getById: jest.fn(),
      // ... other methods
    } as any;

    service = new CartService(mockCartRepo, mockProductRepo);
  });

  it("should throw ProductNotFoundError for invalid product", async () => {
    mockProductRepo.getById.mockRejectedValue(new ProductNotFoundError("invalid"));

    await expect(service.addToCart("cart1", "invalid", 1)).rejects.toThrow(ProductNotFoundError);
  });

  it("should add product to new cart", async () => {
    const mockProduct = { id: "p1", name: "Product 1", price: 10 };
    mockProductRepo.getById.mockResolvedValue(mockProduct);
    mockCartRepo.getById.mockRejectedValue(new CartNotFoundError("cart1"));
    mockCartRepo.update.mockResolvedValue();

    const result = await service.addToCart("cart1", "p1", 2);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(2);
    expect(result.total).toBe(20);
  });

  // Add more tests...
});
```

## Creating Configuration Interfaces

For use case configurations, create simple interfaces in the application layer:

### Step 1: Define the Configuration Interface

```typescript
// src/application/interfaces/ICheckoutConfig.ts
export interface ICheckoutConfig {
  cartId: string;
  shippingAddress: string;
  paymentMethod: string;
  discountCode?: string;
}
```

### Step 2: Export the Interface

```typescript
// src/application/interfaces/index.ts
export { ICheckoutConfig } from './ICheckoutConfig';

// src/index.ts (if public API)
export { ICheckoutConfig } from './application/interfaces';
```

## Creating Domain Errors

All errors should extend `DomainError` for consistent error handling with HTTP status codes.

### Template for New Domain Error

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

### Export the Error

```typescript
// src/domain/errors/index.ts
export { CartEmptyError } from "./CartEmptyError";
```

### Error Status Codes

- `400` - Bad Request (InvalidParameterError, ValidationError, CartEmptyError)
- `404` - Not Found (ProductNotFoundError, CartNotFoundError, OrderNotFoundError)
- `409` - Conflict (ProductOutOfStockError, DuplicateCartError)
- `429` - Too Many Requests (RateLimitError)
- `500` - Internal Server Error (UnexpectedError)

## Code Generation Checklist

### Creating a Repository
- [ ] Define interface in `src/domain/interfaces/I{Name}Repository.ts`
- [ ] Create domain error class if needed in `src/domain/errors/{Name}NotFoundError.ts`
- [ ] Implement repository in `src/infrastructure/repositories/{Name}Repository.ts`
- [ ] Export interface from `src/domain/interfaces/index.ts`
- [ ] Export error from `src/domain/errors/index.ts`
- [ ] Export repository from `src/infrastructure/repositories/index.ts`
- [ ] Register repository in `src/infrastructure/di/DIRegistration.ts`
- [ ] Create test file `tests/infrastructure/unit/{Name}Repository.test.ts`
- [ ] Write tests for all CRUD operations
- [ ] Write tests for error cases

### Creating a Service
- [ ] Define interface in `src/application/interfaces/I{Name}Service.ts`
- [ ] Implement service in `src/application/services/{Name}Service.ts`
- [ ] Export interface from `src/application/interfaces/index.ts`
- [ ] Export service from `src/application/services/index.ts`
- [ ] Register service in `src/infrastructure/di/DIRegistration.ts`
- [ ] Create test file `tests/application/unit/{Name}Service.test.ts`
- [ ] Write tests for all methods
- [ ] Write tests for error cases
- [ ] Write tests for edge cases

### Creating a Configuration Interface
- [ ] Define interface in `src/application/interfaces/I{Name}Config.ts`
- [ ] Export from `src/application/interfaces/index.ts`
- [ ] Export from `src/index.ts` if public API

### Creating a Domain Error
- [ ] Create error class in `src/domain/errors/{Name}Error.ts`
- [ ] Extend `DomainError` with appropriate status code
- [ ] Export from `src/domain/errors/index.ts`
- [ ] Use error in repository or service

## Important Reminders

1. **Always use dependency injection**: Constructor injection for all dependencies
2. **One interface per file**: File name must match interface name
3. **Export everything**: Add to layer index and main index if public
4. **Register with DI**: All repositories and services must be registered
5. **Write tests**: Test files for all new repositories and services
6. **Use domain errors**: Never throw generic Error instances
7. **Document your code**: Add JSDoc comments for public methods
