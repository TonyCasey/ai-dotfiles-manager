# Python Testing Standards

**Note:** For universal testing principles, see `shared/testing-principles.md`. This document covers Python and pytest-specific practices.

## Testing Framework

We use **pytest** for Python projects.

### Setup

```bash
pip install pytest pytest-asyncio pytest-cov pytest-mock
```

### Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--strict-config",
    "--cov=src",
    "--cov-report=html",
    "--cov-report=term-missing:skip-covered",
]

[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*", "*/test_*.py"]

[tool.coverage.report]
precision = 2
show_missing = true
skip_covered = true
```

## Test Structure

### File Naming

```
tests/
├── unit/
│   ├── domain/
│   │   └── services/
│   │       └── test_product_service.py
│   └── application/
│       └── services/
│           └── test_order_service.py
└── integration/
    └── repositories/
        └── test_product_repository_integration.py
```

### Test Classes and Functions

```python
class TestProductService:
    """Tests for ProductService"""

    def test_get_product_when_exists(self):
        # Test implementation
        pass

    def test_get_product_raises_error_when_not_found(self):
        # Test implementation
        pass

    def test_create_product_with_valid_data(self):
        # Test implementation
        pass
```

## Unit Testing with Mocks

```python
import pytest
from unittest.mock import Mock, AsyncMock
from src.application.services.product_service import ProductService
from src.domain.errors.product_not_found_error import ProductNotFoundError

class TestProductService:
    @pytest.fixture
    def mock_product_repository(self):
        """Create mock repository"""
        return Mock()

    @pytest.fixture
    def mock_logger(self):
        """Create mock logger"""
        return Mock()

    @pytest.fixture
    def service(self, mock_product_repository, mock_logger):
        """Create service with mocked dependencies"""
        return ProductService(mock_product_repository, mock_logger)

    def test_get_product_returns_product_when_exists(
        self,
        service,
        mock_product_repository
    ):
        # Arrange
        mock_product = Mock(id="123", name="Test Product", price=99.99)
        mock_product_repository.get_by_id.return_value = mock_product

        # Act
        result = service.get_product("123")

        # Assert
        assert result == mock_product
        mock_product_repository.get_by_id.assert_called_once_with("123")

    def test_get_product_raises_error_when_not_found(
        self,
        service,
        mock_product_repository,
        mock_logger
    ):
        # Arrange
        mock_product_repository.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ProductNotFoundError):
            service.get_product("999")

        mock_product_repository.get_by_id.assert_called_once_with("999")
        mock_logger.warning.assert_called_once()
```

## Async Testing

```python
import pytest

class TestAsyncProductService:
    @pytest.fixture
    def mock_repository(self):
        mock = Mock()
        mock.get_by_id = AsyncMock()
        mock.save = AsyncMock()
        return mock

    @pytest.mark.asyncio
    async def test_get_product_async(self, service, mock_repository):
        # Arrange
        mock_product = {"id": "123", "name": "Test"}
        mock_repository.get_by_id.return_value = mock_product

        # Act
        result = await service.get_product("123")

        # Assert
        assert result == mock_product
        mock_repository.get_by_id.assert_awaited_once_with("123")
```

## Fixtures and Parametrize

```python
import pytest

@pytest.fixture
def sample_product():
    """Reusable test data"""
    return {
        "id": "123",
        "name": "Test Product",
        "price": 99.99
    }

@pytest.mark.parametrize("price,expected", [
    (100, 90),   # 10% discount
    (50, 45),
    (10, 9),
])
def test_calculate_discount(price, expected):
    result = calculate_discount(price, 0.1)
    assert result == expected
```

## Integration Tests

```python
import pytest
from src.infrastructure.repositories.product_repository import ProductRepository

class TestProductRepositoryIntegration:
    @pytest.fixture(scope="class")
    def db(self):
        """Set up test database"""
        db = create_test_database()
        yield db
        db.disconnect()

    @pytest.fixture(autouse=True)
    def clean_db(self, db):
        """Clean database before each test"""
        db.clear_collection("products")

    def test_save_and_retrieve_product(self, db):
        # Arrange
        repository = ProductRepository(db)
        product = Product(id="123", name="Test", price=99.99)

        # Act
        repository.save(product)
        retrieved = repository.get_by_id("123")

        # Assert
        assert retrieved == product
```

## Assertions

```python
# Equality
assert value == expected
assert value != other

# Membership
assert item in collection
assert item not in collection

# Boolean
assert condition
assert not condition

# Exceptions
with pytest.raises(ValueError):
    function_that_raises()

with pytest.raises(ValueError, match="specific message"):
    function_that_raises()

# Approximate comparison
assert value == pytest.approx(expected, rel=1e-3)

# Mock assertions
mock.assert_called()
mock.assert_called_once()
mock.assert_called_with(arg1, arg2)
mock.assert_called_once_with(arg1, arg2)
mock.assert_not_called()
```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test file
pytest tests/unit/test_product_service.py

# Run specific test
pytest tests/unit/test_product_service.py::TestProductService::test_get_product

# Run with markers
pytest -m unit
pytest -m integration

# Verbose output
pytest -v

# Stop on first failure
pytest -x

# Rerun failed tests
pytest --lf

# Run in parallel
pytest -n auto
```

## Best Practices

### Do's
- ✅ Use fixtures for setup
- ✅ Use `pytest.mark.asyncio` for async tests
- ✅ Use parametrize for multiple test cases
- ✅ Use type hints in tests
- ✅ Mock external dependencies
- ✅ Use descriptive test names

### Don'ts
- ❌ Don't use `unittest.TestCase` (use pytest style)
- ❌ Don't share state between tests
- ❌ Don't test implementation details
- ❌ Don't ignore warnings

For universal testing principles, see `shared/testing-principles.md`.
