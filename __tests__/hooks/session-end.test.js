/**
 * Unit Tests for session-end.js hook
 * Tests the Claude Code session end hook functionality
 */

describe('Session End Hook', () => {
  let sessionEnd;

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
        sessionEnd = require('../../templates/claude/hooks/session-end.js');
      }).not.toThrow();
    });

    it('should export required functions', () => {
      // Arrange
      sessionEnd = require('../../templates/claude/hooks/session-end.js');

      // Assert
      expect(sessionEnd).toHaveProperty('findCompletedTasks');
      expect(sessionEnd).toHaveProperty('commitCompletedTasks');
      expect(sessionEnd).toHaveProperty('main');
      expect(typeof sessionEnd.findCompletedTasks).toBe('function');
      expect(typeof sessionEnd.commitCompletedTasks).toBe('function');
      expect(typeof sessionEnd.main).toBe('function');
    });
  });

  describe('findCompletedTasks', () => {
    it('should identify newly completed tasks', () => {
      // Arrange
      sessionEnd = require('../../templates/claude/hooks/session-end.js');
      const oldContent = `
# Todo
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
`;
      const newContent = `
# Todo
- [x] Task 1
- [ ] Task 2
- [x] Task 3
`;

      // Act
      const completed = sessionEnd.findCompletedTasks(oldContent, newContent);

      // Assert
      expect(Array.isArray(completed)).toBe(true);
      expect(completed.length).toBeGreaterThan(0);
      expect(completed).toContain('Task 1');
      expect(completed).toContain('Task 3');
      expect(completed).not.toContain('Task 2');
    });

    it('should return empty array when no tasks completed', () => {
      // Arrange
      sessionEnd = require('../../templates/claude/hooks/session-end.js');
      const oldContent = '- [ ] Task 1\n- [ ] Task 2';
      const newContent = '- [ ] Task 1\n- [ ] Task 2';

      // Act
      const completed = sessionEnd.findCompletedTasks(oldContent, newContent);

      // Assert
      expect(Array.isArray(completed)).toBe(true);
      expect(completed).toHaveLength(0);
    });

    it('should handle empty inputs', () => {
      // Arrange
      sessionEnd = require('../../templates/claude/hooks/session-end.js');

      // Act
      const completed = sessionEnd.findCompletedTasks('', '');

      // Assert
      expect(Array.isArray(completed)).toBe(true);
      expect(completed).toHaveLength(0);
    });
  });

  describe('File Structure', () => {
    it('should be a valid JavaScript file', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../../templates/claude/hooks/session-end.js');

      // Check file exists
      expect(fs.existsSync(hookPath)).toBe(true);

      // Check file is readable
      const content = fs.readFileSync(hookPath, 'utf-8');
      expect(content).toContain('findCompletedTasks');
      expect(content).toContain('commitCompletedTasks');
      expect(content).toContain('module.exports');
    });

    it('should have shebang for direct execution', () => {
      const fs = require('fs');
      const path = require('path');
      const hookPath = path.join(__dirname, '../../templates/claude/hooks/session-end.js');
      const content = fs.readFileSync(hookPath, 'utf-8');

      expect(content).toMatch(/^#!/);
    });
  });
});
