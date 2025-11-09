/**
 * Jest setup file
 * Runs before each test suite
 */

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add custom matchers if needed
expect.extend({
  toBeValidPath(received) {
    const pass = typeof received === 'string' && received.length > 0;
    return {
      pass,
      message: () => `expected ${received} to be a valid path`,
    };
  },
});
