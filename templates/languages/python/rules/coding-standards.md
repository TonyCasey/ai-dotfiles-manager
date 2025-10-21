# Python Coding Standards

**Note:** This document covers Python-specific conventions. For universal architecture principles, see `shared/clean-architecture.md`.

## Type Safety

### Type Hints (PEP 484)

**ALWAYS use type hints** for function signatures and class attributes:

```python
from typing import List, Optional, Dict

# ✅ GOOD - with type hints
def calculate_total(items: List[CartItem]) -> float:
    return sum(item.price for item in items)

def get_product(product_id: str) -> Optional[Product]:
    # Returns Product or None
    pass

# ❌ BAD - no type hints
def calculate_total(items):
    return sum(item.price for item in items)
```

### Static Type Checking with mypy

Use mypy for static type checking:

```bash
# Install
pip install mypy

# Run type checking
mypy src/

# Configuration in pyproject.toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### Protocol for Structural Typing

Use `Protocol` for defining interfaces (similar to TypeScript interfaces):

```python
from typing import Protocol

# ✅ GOOD - Protocol defines interface
class ProductRepositoryProtocol(Protocol):
    def get_by_id(self, id: str) -> Optional[Product]:
        ...

    def save(self, product: Product) -> None:
        ...

    def delete(self, id: str) -> None:
        ...

class ProductRepository:
    """Concrete implementation of ProductRepositoryProtocol"""

    def __init__(self, db: DatabaseProtocol) -> None:
        self._db = db

    def get_by_id(self, id: str) -> Optional[Product]:
        doc = self._db.read_doc_at_path(f"products/{id}")
        return Product(**doc) if doc else None

    def save(self, product: Product) -> None:
        self._db.write_doc_at_path(f"products/{product.id}", product.to_dict())

    def delete(self, id: str) -> None:
        self._db.delete_doc_at_path(f"products/{id}")
```

### Avoid `Any` Type

**Minimize use of `Any` type**:

```python
from typing import Any, Dict, TypedDict

# ❌ BAD
def process_data(data: Any) -> Any:
    return data['something']

# ✅ GOOD - use TypedDict for structured dicts
class ProductData(TypedDict):
    id: str
    name: str
    price: float

def process_data(data: ProductData) -> str:
    return data['name']
```

## Naming Conventions

### Modules and Packages

**snake_case for modules:**

```python
# ✅ GOOD
product_repository.py
order_service.py
user_authentication.py

# ❌ BAD
ProductRepository.py
OrderService.py
```

### Classes

**PascalCase for classes:**

```python
# ✅ GOOD
class ProductService:
    pass

class ProductRepository:
    pass

class DomainError(Exception):
    pass

# ❌ BAD
class product_service:
    pass
```

### Protocols (Interfaces)

**Suffix with `Protocol` instead of `I` prefix:**

```python
# ✅ GOOD - Python convention
class ProductRepositoryProtocol(Protocol):
    def get_by_id(self, id: str) -> Optional[Product]:
        ...

class ProductServiceProtocol(Protocol):
    def get_product(self, id: str) -> Product:
        ...

# ❌ BAD - TypeScript/C# convention
class IProductRepository(Protocol):
    pass
```

### Functions and Variables

**snake_case for functions and variables:**

```python
# ✅ GOOD
product_list: List[Product] = []
user_id: str = "123"

def calculate_discount(price: float) -> float:
    return price * 0.1

async def fetch_user_data(id: str) -> User:
    ...

# ❌ BAD
productList = []
userId = "123"

def calculateDiscount(price):
    ...
```

### Constants

**UPPER_SNAKE_CASE for constants:**

```python
# ✅ GOOD
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT_SECONDS = 5.0
API_BASE_URL = "https://api.example.com"

# ❌ BAD
maxRetryAttempts = 3
default_timeout = 5.0
```

### Private Members

**Prefix with underscore for private:**

```python
class ProductService:
    def __init__(self, repository: ProductRepositoryProtocol) -> None:
        self._repository = repository  # Private attribute

    def _validate_product(self, product: Product) -> None:
        # Private method
        if not product.name:
            raise ValidationError("Name required")

    def create_product(self, data: ProductData) -> Product:
        # Public method
        product = Product(**data)
        self._validate_product(product)
        self._repository.save(product)
        return product
```

## File Organization

### One Class Per File

Each class gets its own file:

```python
# ✅ GOOD
# File: src/domain/interfaces/product_repository_protocol.py
class ProductRepositoryProtocol(Protocol):
    ...

# File: src/infrastructure/repositories/product_repository.py
class ProductRepository:
    ...
```

### Package `__init__.py` for Exports

Use `__init__.py` for clean imports:

```python
# File: src/domain/interfaces/__init__.py
from .product_repository_protocol import ProductRepositoryProtocol
from .order_repository_protocol import OrderRepositoryProtocol
from .user_repository_protocol import UserRepositoryProtocol

__all__ = [
    "ProductRepositoryProtocol",
    "OrderRepositoryProtocol",
    "UserRepositoryProtocol",
]

# Now you can import as:
from src.domain.interfaces import ProductRepositoryProtocol, OrderRepositoryProtocol
```

## Clean Architecture Implementation

### Repository Protocol (Domain)

```python
# File: src/domain/interfaces/product_repository_protocol.py
from typing import Protocol, Optional, List
from src.domain.entities.product import Product

class ProductRepositoryProtocol(Protocol):
    def get_by_id(self, id: str) -> Optional[Product]:
        """Get product by ID. Returns None if not found."""
        ...

    def save(self, product: Product) -> None:
        """Save or update product."""
        ...

    def delete(self, id: str) -> None:
        """Delete product by ID."""
        ...

    def find_by_category(self, category_id: str) -> List[Product]:
        """Find all products in a category."""
        ...
```

### Repository Implementation (Infrastructure)

```python
# File: src/infrastructure/repositories/product_repository.py
from typing import Optional, List
from src.domain.entities.product import Product
from src.domain.interfaces.product_repository_protocol import ProductRepositoryProtocol
from src.infrastructure.interfaces.database_protocol import DatabaseProtocol
from src.domain.errors.repository_error import RepositoryError

class ProductRepository:
    """Implementation of ProductRepositoryProtocol using database."""

    def __init__(self, db: DatabaseProtocol) -> None:
        self._db = db

    def get_by_id(self, id: str) -> Optional[Product]:
        try:
            doc = self._db.read_doc_at_path(f"products/{id}")
            return Product.from_dict(doc) if doc else None
        except Exception as e:
            raise RepositoryError(
                f"Failed to fetch product: {id}",
                original_error=e
            ) from e

    def save(self, product: Product) -> None:
        self._db.write_doc_at_path(
            f"products/{product.id}",
            product.to_dict()
        )

    def delete(self, id: str) -> None:
        self._db.delete_doc_at_path(f"products/{id}")

    def find_by_category(self, category_id: str) -> List[Product]:
        docs = self._db.query_collection(
            "products",
            filters={"category_id": category_id}
        )
        return [Product.from_dict(doc) for doc in docs]
```

### Service (Application)

```python
# File: src/application/services/product_service.py
from typing import List
from src.application.interfaces.product_service_protocol import ProductServiceProtocol
from src.domain.interfaces.product_repository_protocol import ProductRepositoryProtocol
from src.domain.interfaces.logger_protocol import LoggerProtocol
from src.domain.entities.product import Product
from src.domain.errors.product_not_found_error import ProductNotFoundError
from src.domain.errors.validation_error import ValidationError

class ProductService:
    """Service for managing products."""

    def __init__(
        self,
        product_repository: ProductRepositoryProtocol,
        logger: LoggerProtocol
    ) -> None:
        self._product_repository = product_repository
        self._logger = logger

    def get_product(self, id: str) -> Product:
        """Get product by ID."""
        product = self._product_repository.get_by_id(id)

        if product is None:
            self._logger.warning(f"Product not found: {id}")
            raise ProductNotFoundError(id)

        self._logger.info(f"Product retrieved: {id}")
        return product

    def create_product(self, data: ProductData) -> Product:
        """Create a new product."""
        # Validation
        self._validate_product_data(data)

        # Create entity
        product = Product(
            id=generate_id(),
            name=data["name"],
            price=data["price"],
            category_id=data["category_id"]
        )

        # Save
        self._product_repository.save(product)

        self._logger.info(f"Product created: {product.id}")
        return product

    def _validate_product_data(self, data: ProductData) -> None:
        """Validate product data."""
        if not data.get("name") or not data["name"].strip():
            raise ValidationError("Product name is required")

        if data.get("price", 0) <= 0:
            raise ValidationError("Product price must be positive")
```

## Dependency Injection

**Use constructor injection for dependencies:**

```python
# ✅ GOOD - Constructor injection
class OrderService:
    def __init__(
        self,
        order_repository: OrderRepositoryProtocol,
        product_repository: ProductRepositoryProtocol,
        logger: LoggerProtocol
    ) -> None:
        self._order_repository = order_repository
        self._product_repository = product_repository
        self._logger = logger

    async def create_order(self, data: OrderData) -> Order:
        # Use injected dependencies
        products = await self._product_repository.find_by_ids(data.product_ids)
        ...

# ❌ BAD - Direct instantiation
class OrderService:
    async def create_order(self, data: OrderData) -> Order:
        order_repo = OrderRepository()  # Hard to test!
        ...
```

### Dependency Injection Container

```python
# File: src/infrastructure/di/container.py
from typing import Dict, Callable, Any, TypeVar

T = TypeVar('T')

class Container:
    """Simple dependency injection container."""

    def __init__(self) -> None:
        self._services: Dict[type, Callable[[], Any]] = {}

    def register(self, interface: type, factory: Callable[[], Any]) -> None:
        """Register a service factory."""
        self._services[interface] = factory

    def resolve(self, interface: type[T]) -> T:
        """Resolve a service instance."""
        if interface not in self._services:
            raise ValueError(f"Service not registered: {interface}")

        return self._services[interface]()

# Usage
container = Container()

# Register services
container.register(
    ProductRepositoryProtocol,
    lambda: ProductRepository(container.resolve(DatabaseProtocol))
)

container.register(
    ProductServiceProtocol,
    lambda: ProductService(
        container.resolve(ProductRepositoryProtocol),
        container.resolve(LoggerProtocol)
    )
)

# Resolve service
product_service = container.resolve(ProductServiceProtocol)
```

## Error Handling

### Domain Errors

```python
# File: src/domain/errors/domain_error.py
class DomainError(Exception):
    """Base class for domain errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        data: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.data = data or {}

# File: src/domain/errors/product_not_found_error.py
class ProductNotFoundError(DomainError):
    """Raised when product is not found."""

    def __init__(self, product_id: str) -> None:
        super().__init__(
            f"Product not found: {product_id}",
            status_code=404,
            data={"product_id": product_id}
        )
```

### Try-Except with Proper Typing

```python
from typing import Optional

# ✅ GOOD - Proper error handling
async def fetch_product(id: str) -> Product:
    try:
        product = await product_repository.get_by_id(id)
        if product is None:
            raise ProductNotFoundError(id)
        return product
    except ProductNotFoundError:
        raise  # Re-raise domain errors
    except Exception as e:
        # Transform unknown errors
        logger.error(f"Unexpected error fetching product: {e}", exc_info=True)
        raise ServiceError(
            "Failed to fetch product",
            data={"product_id": id, "original_error": str(e)}
        ) from e
```

## Async/Await

**Use `async`/`await` for asynchronous operations:**

```python
# ✅ GOOD - async/await
async def get_user(id: str) -> User:
    user = await user_repository.get_by_id(id)
    return user

# Parallel operations
async def get_user_with_orders(user_id: str) -> UserWithOrders:
    # Run in parallel
    user, orders = await asyncio.gather(
        user_repository.get_by_id(user_id),
        order_repository.find_by_user(user_id)
    )
    return UserWithOrders(user=user, orders=orders)
```

## Data Classes and Pydantic

### Using dataclasses

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Product:
    id: str
    name: str
    price: float
    category_id: str
    created_at: datetime
    updated_at: datetime

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "category_id": self.category_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Product":
        return cls(
            id=data["id"],
            name=data["name"],
            price=data["price"],
            category_id=data["category_id"],
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"])
        )
```

### Using Pydantic for Validation

```python
from pydantic import BaseModel, Field, validator

class Product(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    category_id: str

    @validator('name')
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v

    class Config:
        frozen = True  # Immutable
```

## Code Quality Checklist

- [ ] Type hints on all function signatures
- [ ] mypy passes with strict mode
- [ ] Protocols used for interfaces (suffix with `Protocol`)
- [ ] snake_case for functions, variables, modules
- [ ] PascalCase for classes
- [ ] One class per file
- [ ] `__init__.py` exports for clean imports
- [ ] Constructor injection for dependencies
- [ ] Private members prefixed with `_`
- [ ] Proper error handling with domain errors
- [ ] async/await for async operations
- [ ] dataclasses or Pydantic for data models

## Tooling

### Recommended Tools

- **Type Checker**: `mypy`
- **Linter**: `pylint` or `flake8`
- **Formatter**: `black`
- **Import Sorter**: `isort`
- **Testing**: `pytest`
- **Package Manager**: `poetry` or `pip`

### Configuration

```toml
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py311']

[tool.isort]
profile = "black"
line_length = 100

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
disallow_untyped_defs = true

[tool.pylint.messages_control]
max-line-length = 100
disable = ["C0111", "C0103"]
```

### Pre-commit Checks

```bash
# Format code
black src/ tests/

# Sort imports
isort src/ tests/

# Type checking
mypy src/

# Linting
pylint src/

# Run tests
pytest
```

For testing specifics, see `languages/python/testing.md`.
For universal architecture principles, see `shared/clean-architecture.md`.
