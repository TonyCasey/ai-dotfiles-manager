# Repository Pattern

**Note:** This pattern applies to ALL programming languages. See your language-specific rules for syntax and implementation details.

## What is the Repository Pattern?

The Repository pattern mediates between the domain and data mapping layers, acting like an in-memory collection of domain objects.

### Key Concepts

- **Abstraction over data access**: Business logic doesn't know about databases
- **Collection-like interface**: Repositories feel like working with collections
- **Domain-centric**: Repositories work with domain entities, not database records
- **Single source of truth**: All data access for an entity goes through its repository

## Benefits

### 1. Separation of Concerns
- Business logic separated from data access
- Domain layer doesn't know about databases
- Easy to change data storage without affecting business logic

### 2. Testability
- Mock repositories in tests
- Test business logic without a database
- Fast, isolated unit tests

### 3. Centralized Data Access
- All database queries in one place
- Consistent error handling
- Easier to optimize and monitor

### 4. Flexibility
- Swap SQL for NoSQL
- Add caching layer
- Change ORMs without affecting business logic

## Structure

### Generic Repository Contract (Required)

- Define a single `IGenericRepository<T>` interface in the domain layer with the common CRUD surface.
- Provide a concrete `GenericRepository<T>` implementation in the infrastructure layer that knows how to talk to the backing store.
- When you need to work with a specific aggregate, declare a variable (or class property) of type `IGenericRepository<Product>` and assign it to `new GenericRepository<Product>(...)`. Example: `const productRepository: IGenericRepository<Product> = new GenericRepository<Product>(deps);`
- You may create thin factory helpers (e.g., `createProductRepository()`), but avoid duplicating per-entity repository classes.

### Service Composition Rule

- Services must depend on the `IGenericRepository<T>` interface but instantiate the concrete implementation inside the service constructor (or equivalent setup). This keeps the dependency type-safe while making the instantiation explicit: the interface is “injected” by virtue of being the field type, and the service owns the `new` call.
- Example (TypeScript):

  ```typescript
  export class ProductService {
    private readonly products: IGenericRepository<IProduct>;

    constructor() {
      this.products = new GenericRepository<IProduct>({ collection: 'products' });
    }
  }
  ```

- Tests can replace `this.products` with a mock that satisfies `IGenericRepository<IProduct>` because the rest of the code only talks to the interface.

### Implementation in Infrastructure Layer

- The `GenericRepository<T>` implementation still lives in `src/infrastructure/repositories/` because it contains IO concerns.
- It should accept the infrastructure-specific dependencies (collection name, table, datasource, etc.) via constructor parameters so that services can pass the correct context when they `new` it up.

## Common Operations

### Basic CRUD Operations

Repositories typically provide these operations:

1. **Create**: Add new entities
2. **Read**: Retrieve entities by ID or criteria
3. **Update**: Modify existing entities
4. **Delete**: Remove entities

### Query Methods

Beyond CRUD, repositories can provide domain-specific queries:

- `findByEmail(email)`
- `findActiveOrders(userId)`
- `findProductsByCategory(categoryId)`
- `searchByName(query)`

### Pagination

For large collections:

- `findAll(page, pageSize)`
- `findByCriteria(criteria, offset, limit)`

## Design Guidelines

### 1. Typed Generic Instances Per Aggregate

Every aggregate still gets its own logical repository, but it is created by parameterizing the shared `IGenericRepository<T>` contract instead of creating a bespoke class.

**Example:**
- `const productRepository: IGenericRepository<Product> = new GenericRepository<Product>(...)`
- `const orderRepository: IGenericRepository<Order> = new GenericRepository<Order>(...)`

Avoid catch-all instances that mix aggregates; create a dedicated generic instance per aggregate so configuration (collection name, table, etc.) stays isolated.

### 2. Use Domain Entities

Repositories work with domain entities, not DTOs or database models.

**Input:** Domain entities
**Output:** Domain entities
**Internal:** Database models (hidden from domain)

### 3. Keep Operations Focused

`IGenericRepository<T>` should stay lean (CRUD + simple filters). If you need specialized queries, compose them outside the repository via specification objects or helper functions that call into the generic contract. This keeps the interface stable and prevents “kitchen sink” repositories.

**Prefer:**
- `productRepository.findByIds(ids)` implemented via a shared helper that still delegates to the generic repo
- Specification objects that encapsulate a complex filter and pass it to the generic repo

**Avoid:**
- Embedding business logic (`calculateOrderTotal`)
- Triggering side effects (`sendEmailToCustomer`)
- Mixing validation logic inside the repository

### 4. Handle Errors Appropriately

Repositories should translate data access errors into domain errors.

**Responsibilities:**
- Catch database exceptions
- Transform to domain-specific errors
- Provide meaningful error messages
- Include relevant context

## Common Patterns

### 1. Generic Repository Base (Standard)

All new repositories MUST go through the shared `IGenericRepository<T>` contract. Do not create bespoke repository classes unless you have proven the generic abstraction cannot satisfy a use case.

**Benefits:**
- Single place to test and harden data-access behavior
- Consistent interface across aggregates
- Services can swap the implementation (real vs mock) by targeting the same contract

### 2. Specification Pattern

Encapsulate query logic in reusable specifications:

**Benefits:**
- Reusable query logic
- Composable criteria
- Testable query logic

**When to use:**
- Complex queries
- Reusable criteria combinations
- Dynamic query building

### 3. Unit of Work Pattern

Coordinate multiple repository operations in a transaction:

**Benefits:**
- Transactional consistency
- Batch operations
- Rollback on failure

**When to use:**
- Multi-repository operations
- Transactional boundaries
- Coordinated changes

## Error Handling

### Not Found Scenarios

Two approaches:

**1. Return null/None/nil:**
```
// Returns null if not found
entity = repository.getById(id)
if entity is null:
    handle not found
```

**2. Throw exception:**
```
// Throws NotFoundError if not found
try:
    entity = repository.getById(id)
catch NotFoundError:
    handle not found
```

**Recommendation:** Be consistent across all repositories

### Database Errors

Transform database errors to domain errors:

1. Catch database-specific exceptions
2. Log error details for debugging
3. Throw domain-specific error
4. Include relevant context (entity ID, operation)

## Testing Repositories

### Unit Tests (with mocks)

Test business logic with mocked repositories:

**Benefits:**
- Fast tests
- No database needed
- Test edge cases easily

**What to test:**
- Business logic using the repository
- Error handling
- Edge cases

### Integration Tests (with real database)

Test repository implementations:

**Benefits:**
- Verify actual data access
- Test query correctness
- Catch SQL errors

**What to test:**
- CRUD operations
- Query methods
- Error scenarios (connection failures, constraint violations)
- Transaction handling

## Common Anti-Patterns

### ❌ Business Logic in Repository

**Problem:** Repository performs calculations or business rules

**Solution:** Keep repositories focused on data access

### ❌ Repository Calling Another Repository

**Problem:** Creates tight coupling and hidden dependencies

**Solution:** Services orchestrate multiple repositories

### ❌ Leaking Database Details

**Problem:** Repository interface exposes SQL, ORM, or database concepts

**Solution:** Use domain language in interface

### ❌ Anemic Repository

**Problem:** Repository is just a thin wrapper with no value

**Solution:** If it's just pass-through, you might not need the pattern

### ❌ Bypassing the Generic Repository

**Problem:** Creating ad-hoc repository classes or hitting the datasource directly

**Solution:** Always go through `IGenericRepository<T>` so behavior stays consistent and test doubles work

## When NOT to Use Repository Pattern

The repository pattern isn't always necessary:

**Skip it when:**
- Very simple CRUD with no business logic
- Direct ORM usage is simpler
- Over-engineering for small projects
- Adds complexity without benefit

**Use it when:**
- Separation of concerns is important
- Business logic needs to be testable
- May need to swap data sources
- Complex querying logic
- Team needs consistent data access patterns

## Interface-Centric Instantiation

- Declare repository fields as `IGenericRepository<T>` inside services/use cases.
- Instantiate the concrete `GenericRepository<T>` inside the constructor (or a factory method) and pass in the infrastructure dependencies the service already owns.
- For tests, assign a mock that implements `IGenericRepository<T>` to the same field—because the rest of the code only talks to the interface, no other changes are needed.
- If you use a DI container, have it provide the dependencies required by `GenericRepository<T>` (e.g., datasource, logger). The service still performs the `new` so the pattern remains explicit.

## Summary Checklist

- [ ] `IGenericRepository<T>` defined in the domain layer
- [ ] `GenericRepository<T>` lives in infrastructure and handles IO
- [ ] Each aggregate receives its own configured `IGenericRepository<Entity>` instance
- [ ] Services store repositories as the interface type and instantiate them internally
- [ ] Tests replace the interface with mocks when needed
- [ ] Repositories operate only on domain entities and translate errors appropriately
- [ ] No business logic or side effects in repositories
- [ ] Consistent error handling and specification support across aggregates

## Language-Specific Examples

For implementation syntax and idioms in your language:

- **TypeScript**: `languages/typescript/coding-standards.md`
- **Python**: `languages/python/coding-standards.md`
- **Go**: `languages/go/coding-standards.md`
- **Java**: `languages/java/coding-standards.md`
