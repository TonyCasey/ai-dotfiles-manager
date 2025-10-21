# Clean Architecture Rules

## Overview

The codebase follows **Clean Architecture** principles with a three-layer structure emphasizing separation of concerns and dependency inversion.

## Layer Structure

```
src/
├── domain/              # Core business entities and interfaces
│   ├── errors/          # Domain error classes
│   └── interfaces/      # Repository interfaces, core service interfaces
├── application/         # Business logic and use cases
│   ├── interfaces/      # Service interfaces, use case configs
│   └── services/        # Service implementations
├── infrastructure/      # External concerns (Firebase, Elastic, GitHub)
│   ├── di/             # Dependency injection container
│   ├── repositories/   # Repository implementations
│   └── interfaces/     # External system interfaces
└── utils/              # Legacy utility functions (gradually migrating to layers)
```

## Architectural Layers Explained

### 1. Domain Layer (`src/domain/`)
- **Purpose**: Contains core business interfaces with no external dependencies
- **What belongs here**: Core business concepts, entities representing business rules, interfaces that should not depend on external frameworks
- **Examples**:
  - `IAuthService` - Authentication business logic
  - `IEmailService` - Email business logic
  - `IRepository` - Repository pattern interface
- **Rule**: Domain layer has NO dependencies on other layers

### 2. Application Layer (`src/application/`)
- **Purpose**: Orchestrates domain and infrastructure to implement use cases
- **What belongs here**: Use case configurations, application service interfaces, interfaces that coordinate domain and infrastructure
- **Examples**:
  - `ICartService`, `IOrderService` - Application services
  - `ICheckoutConfig`, `IAddToCartConfig` - Use case configurations
  - Product/catalog interfaces - Application-specific logic
- **Rule**: Application can depend on domain, but NOT on infrastructure

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Purpose**: Handles all external system integrations and framework-specific code
- **What belongs here**: External API integrations, database implementations, third-party service abstractions, repository implementations
- **Examples**:
  - `IDatabaseService` - Database integration (Firestore, MongoDB, etc.)
  - `ProductRepository`, `CartRepository`, `OrderRepository` - Data access implementations
  - `IPaymentService` - Payment gateway integration
  - `ISearchService` - Search engine integration
  - Transaction interfaces - Database transaction configurations
- **Rule**: Infrastructure can depend on application and domain

## Repository Pattern

The repository pattern separates data access logic from business logic. All data access should go through repositories.

### Repository Structure

```
src/
├── domain/interfaces/
│   ├── IProductRepository.ts    # Interface defining data operations
│   ├── ICartRepository.ts
│   └── IOrderRepository.ts
└── infrastructure/repositories/
    ├── ProductRepository.ts      # Database implementation
    ├── CartRepository.ts
    └── OrderRepository.ts
```

### Why Use Repositories

- Decouples business logic from data storage
- Makes testing easier (mock repositories instead of Firebase)
- Enables swapping data sources without changing business logic
- Centralizes data access patterns and error handling

## Key Architectural Principles

1. **Dependency Inversion**: Dependencies flow inward (Infrastructure → Application → Domain)
2. **Interface Segregation**: Each interface has a single, focused responsibility
3. **Separation of Concerns**: Business logic separate from infrastructure details
4. **Testability**: Each layer can be tested in isolation with mocks
5. **Maintainability**: Clear boundaries make impact analysis easier

## Dependency Injection Pattern

The codebase uses a DI-based architecture:

```typescript
// DI-aware code tries DI first, falls back to legacy implementation
export const fetchAllProductsInCategory = async (categoryId: string) => {
  try {
    if (container.isRegistered(PRODUCT_SERVICE_TOKEN)) {
      return await fetchAllProductsInCategoryWithDI(categoryId);
    }
  } catch (error) {
    logger.warn("DI container not available, falling back...");
  }
  // Original implementation as fallback
  const databaseService = getDatabaseService();
  // ... legacy code
};
```

**Important:** When modifying data access functions in `src/utils/`, check if DI versions exist and update both paths.

## SOLID Principles

### Single Responsibility Principle (SRP)
- Each interface should have one clear responsibility
- Large services (>20 methods) should be split into focused services
- Avoid creating "god classes" that do everything

### Interface Segregation Principle (ISP)
- Create small, focused interfaces rather than large monolithic ones
- Clients shouldn't depend on methods they don't use
- Consider splitting large services into focused interfaces for new code

### Dependency Inversion Principle (DIP)
- Depend on interfaces, not concrete implementations
- Use constructor injection for dependencies
- Never import external dependencies directly; use abstractions

## Service Design

### Keep Services Focused
- Limit services to ~20 methods
- Split large services by responsibility
- Use clear, descriptive method names

### Use Constructor Injection
```typescript
// GOOD - Constructor injection
export class CartService implements ICartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository
  ) {}
}

// BAD - Direct instantiation
export class CartService implements ICartService {
  async addToCart() {
    const cartRepo = new CartRepository(); // Hard to test
  }
}
```

## Data Access Patterns

### Always Use Repositories for Data Access
```typescript
// GOOD - Using repository
const product = await this.productRepository.getById(productId);

// BAD - Direct database access in service
const product = await this.databaseService.readDocDataAtPath(`products/${productId}`);
```

### Use Factory Pattern for External Services
```typescript
// GOOD - Uses factory for testability
const databaseService = getDatabaseService();

// BAD - Direct import breaks test mocks
import * as database from 'database-client';
```

## Layer Dependencies

- **Domain layer**: No dependencies on other layers
- **Application layer**: Can depend on domain only
- **Infrastructure layer**: Can depend on both application and domain

## When Working with Utils

Check if layer-based equivalent exists before adding to `utils/`. New data access code should use repositories. New business logic should use services.

## Common Pitfalls to Avoid

1. **Violating layer dependencies**: Don't import infrastructure from domain or application
2. **Skipping DI registration**: Always register new repositories and services in `DIRegistration.ts`
3. **Circular dependencies**: If you need to reference a lower layer, restructure your code
4. **Hard-coding database paths**: Use repository abstractions instead
5. **Creating god classes**: Keep interfaces focused and responsibilities clear
