# Architecture Rules

## 1. Clean Architecture Compliance
- **RESPECT LAYER BOUNDARIES** at all times
- Domain layer must not depend on infrastructure or application
- Application layer orchestrates domain and infrastructure
- Infrastructure implements interfaces defined in domain layer
- Use dependency inversion for all cross-layer dependencies

## 2. Layer Structure

```
src/
├── domain/              # Core business entities and interfaces
│   ├── errors/          # Domain error classes
│   └── interfaces/      # Repository interfaces, core service interfaces
├── application/         # Business logic and use cases
│   ├── interfaces/      # Service interfaces, use case configs
│   └── services/        # Service implementations
├── infrastructure/      # External concerns (Firebase, APIs, etc.)
│   ├── di/             # Dependency injection container
│   ├── repositories/   # Repository implementations
│   └── interfaces/     # External system interfaces
└── utils/              # Shared utilities
```

## 3. Dependency Rules

### Domain Layer (`src/domain/`)
- **NO dependencies** on other layers
- Contains core business interfaces and entities
- Defines contracts that other layers implement
- Examples: `IAuthService`, `IRepository`, domain errors

### Application Layer (`src/application/`)
- **CAN depend on**: Domain layer only
- **CANNOT depend on**: Infrastructure layer
- Orchestrates domain and infrastructure
- Examples: Use case services, application configurations

### Infrastructure Layer (`src/infrastructure/`)
- **CAN depend on**: Application and Domain layers
- Implements interfaces defined in domain layer
- Handles all external system integrations
- Examples: Repository implementations, database services

## 4. Repository Pattern

### Structure
- **Repository interfaces** → `src/domain/interfaces/`
- **Repository implementations** → `src/infrastructure/repositories/`

### Rules
- All data access must go through repositories
- Repositories implement domain interfaces
- Services depend on repository interfaces, not implementations
- Register all repositories in DI container

### Example
```typescript
// src/domain/interfaces/IProductRepository.ts
export interface IProductRepository {
  getById(id: string): Promise<Product>;
  save(product: Product): Promise<void>;
}

// src/infrastructure/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  constructor(private readonly db: IDatabaseService) {}

  async getById(id: string): Promise<Product> {
    // Implementation
  }
}
```

## 5. SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each class has one reason to change
- Each interface has one clear responsibility
- Split large services (>20 methods) into focused services

### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- Use interfaces and dependency injection
- Extend behavior through composition

### Liskov Substitution Principle (LSP)
- Subtypes are substitutable for base types
- Implementations must honor interface contracts
- No unexpected behavior in implementations

### Interface Segregation Principle (ISP)
- Clients depend only on interfaces they use
- Create small, focused interfaces
- Avoid monolithic interfaces

### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Use constructor injection for dependencies
- Never import external dependencies directly

## 6. Dependency Injection Pattern

### Constructor Injection
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

### Registration
- **ALWAYS** register services and repositories in DI container
- Use tokens/symbols for interface bindings
- Configure DI at application startup

## 7. Common Violations to Avoid

### Layer Violations
- ❌ Domain importing from infrastructure
- ❌ Application importing from infrastructure
- ❌ Circular dependencies between layers

### Repository Violations
- ❌ Direct database access in services
- ❌ Repository interfaces in infrastructure layer
- ❌ Missing DI registration

### Service Violations
- ❌ Services without constructor injection
- ❌ Direct instantiation of dependencies
- ❌ God classes with too many responsibilities

### Testing Violations
- ❌ Tests coupled to infrastructure
- ❌ Missing tests for repositories/services
- ❌ No mocking of external dependencies
