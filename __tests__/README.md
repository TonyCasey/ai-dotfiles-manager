# Test Suite

Comprehensive unit tests for ai-dotfiles-manager following best practices and SOLID principles.

## Test Framework

- **Jest** - Testing framework with built-in assertions, mocking, and coverage
- **Node.js** test environment
- **TypeScript** AST testing for code review features

## Directory Structure

```
__tests__/
├── helpers/              # Test utilities and mocks
│   └── fs-mock.js        # File system mocking utilities
├── fixtures/             # Test data and sample structures
│   └── project-structures.js  # Sample project configurations
├── lib/                  # Tests for library modules
│   └── language-detector.test.js
├── scripts/              # Tests for scripts
│   └── code-reviewer.test.js
├── setup.js              # Jest setup file
└── README.md             # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Test Patterns

### AAA Pattern (Arrange, Act, Assert)

All tests follow the AAA pattern for clarity:

```javascript
it('should detect TypeScript from tsconfig.json', () => {
  // Arrange - Set up test data and mocks
  const fileSystem = createMockFileSystem(fixtures.typescriptProject);
  const fsMock = createFsMock(fileSystem);

  // Act - Execute the function being tested
  const result = detectLanguage('/test-project', fsMock);

  // Assert - Verify the expected outcome
  expect(result).toBe('typescript');
});
```

### SOLID Principles in Testing

**Single Responsibility**
- Each test tests one thing
- Test files organized by module

**Open/Closed**
- Test utilities can be extended without modification
- Mock helpers provide flexible interfaces

**Liskov Substitution**
- Mocks are substitutable for real implementations
- `createFsMock()` returns object compatible with `fs` module

**Interface Segregation**
- Test helpers provide focused interfaces
- `fs-mock.js` only mocks needed fs functions

**Dependency Inversion**
- Production code accepts interfaces (e.g., `fsModule` parameter)
- Tests inject mock implementations
- No hard dependencies on file system

### Mocking

**File System Mocking**

Use `createMockFileSystem()` and `createFsMock()`:

```javascript
const { createMockFileSystem, createFsMock } = require('./helpers/fs-mock');

// Create mock file system structure
const fileSystem = createMockFileSystem({
  'package.json': JSON.stringify({ name: 'test' }),
  src: {
    'index.ts': 'export {}',
  },
});

// Create mock fs module
const fsMock = createFsMock(fileSystem);

// Use in tests
const result = detectLanguage('/project', fsMock);
```

**Console Mocking**

Console methods are automatically mocked in `setup.js` to reduce test noise:

```javascript
// Already available in all tests
expect(console.log).toHaveBeenCalled();
```

### Test Fixtures

Reusable test data in `fixtures/project-structures.js`:

```javascript
const fixtures = require('./fixtures/project-structures');

// Use predefined project structures
const fileSystem = createMockFileSystem(fixtures.typescriptProject);
const fileSystem = createMockFileSystem(fixtures.nextjsProject);
```

## Coverage Thresholds

Minimum coverage requirements (enforced):

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

View coverage report: `open coverage/index.html` (after running `npm run test:coverage`)

## Writing New Tests

### 1. Choose the Right Location

- Tests for `lib/*.js` → `__tests__/lib/*.test.js`
- Tests for `bin/*.js` → `__tests__/bin/*.test.js`
- Tests for `scripts/*.js` → `__tests__/scripts/*.test.js`

### 2. Follow Naming Conventions

- Test files: `*.test.js`
- Describe blocks: Describe the module/class
- Test cases: Use clear, descriptive names starting with "should"

```javascript
describe('LanguageDetector', () => {
  describe('detectLanguage', () => {
    it('should detect TypeScript from tsconfig.json', () => {
      // test
    });

    it('should return null for unknown projects', () => {
      // test
    });
  });
});
```

### 3. Test Edge Cases

Always test:
- Happy path
- Error cases
- Edge cases (empty input, null, undefined)
- Boundary conditions

### 4. Use Dependency Injection

Make code testable by accepting dependencies:

```javascript
// Good - testable
function detectLanguage(projectRoot, fsModule = fs) {
  return fsModule.existsSync(path.join(projectRoot, 'tsconfig.json'));
}

// Bad - hard to test
function detectLanguage(projectRoot) {
  return fs.existsSync(path.join(projectRoot, 'tsconfig.json'));
}
```

### 5. Keep Tests Focused

- One assertion per test (when possible)
- Test one behavior per test
- Avoid testing implementation details

## Best Practices

✅ **Do:**
- Write descriptive test names
- Use AAA pattern
- Mock external dependencies
- Test edge cases
- Keep tests simple and readable
- Follow SOLID principles

❌ **Don't:**
- Test implementation details
- Create brittle tests
- Skip error cases
- Have shared mutable state between tests
- Make tests depend on each other

## Continuous Integration

Tests run automatically on:
- Every commit
- Pull request creation
- Before releases

Failed tests block merges.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
