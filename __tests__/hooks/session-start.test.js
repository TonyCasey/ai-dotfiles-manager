/**
 * Unit Tests for session-start.js hook
 * Tests the Claude Code session start hook functionality
 */

describe('Session Start Hook', () => {
  let sessionStart;

  beforeEach(() => {
    // Clear module cache
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module Loading', () => {
    it('should load without errors', () => {
      // Act & Assert - should not throw
      expect(() => {
        sessionStart = require('../../templates/claude/hooks/session-start.js');
      }).not.toThrow();
    });

    it('should export required functions', () => {
      // Arrange
      sessionStart = require('../../templates/claude/hooks/session-start.js');

      // Assert
      expect(sessionStart).toHaveProperty('loadRules');
      expect(sessionStart).toHaveProperty('loadProjectContext');
      expect(sessionStart).toHaveProperty('main');
      expect(typeof sessionStart.loadRules).toBe('function');
      expect(typeof sessionStart.loadProjectContext).toBe('function');
      expect(typeof sessionStart.main).toBe('function');
    });
  });

  describe('Exported Functions', () => {
    it('loadRules should be callable', () => {
      // Arrange
      sessionStart = require('../../templates/claude/hooks/session-start.js');

      // Act & Assert - should not throw
      expect(() => {
        const result = sessionStart.loadRules();
        expect(typeof result).toBe('boolean');
      }).not.toThrow();
    });

    it('loadProjectContext should be callable', () => {
      // Arrange
      sessionStart = require('../../templates/claude/hooks/session-start.js');

      // Act & Assert - should not throw
      expect(() => {
        sessionStart.loadProjectContext();
      }).not.toThrow();
    });
  });

  describe('File Structure', () => {
    it('should be a valid JavaScript file', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../../templates/claude/hooks/session-start.js');

      // Check file exists
      expect(fs.existsSync(hookPath)).toBe(true);

      // Check file is readable
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('loadRules');
      expect(content).toContain('loadProjectContext');
      expect(content).toContain('module.exports');
    });

    it('should have shebang for direct execution', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../../templates/claude/hooks/session-start.js');
      const content = fs.readFileSync(hookPath, 'utf-8');

      expect(content).toMatch(/^#!/);
    });
  });
});
